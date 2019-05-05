import os

import json
import pytest

os.environ['TEST'] = '1'
if os.path.exists('test.db'):
    os.remove('test.db')

from server.api import *
from server.models import *
from server.main import app, db, api

api.add_resource(LoginEndpoint, '/login')
api.add_resource(RegisterEndpoint, '/register')
api.add_resource(UsersEndpoint, '/users')
api.add_resource(UserEndpoint, '/users/<user_id>')
api.add_resource(CurrentUserEndpoint, '/current-user')
api.add_resource(UserWorkEntriesEndpoint, '/work-entries/<user_id>')
api.add_resource(WorkEntryEndpoint, '/work-entries/<work_entry_id>')


@pytest.fixture(autouse=True)
def tear_up_down_db():
    db.create_all()

    yield

    db.drop_all()


app = app.test_client()

def request(method, url, token=None, **kwargs):
    headers = kwargs.get('headers', {})
    headers['Content-Type'] = 'application/json'
    if token:
        headers['Authorization'] = 'Bearer ' + token

    kwargs['headers'] = headers

    return app.open(url, method=method, **kwargs)


def create_user(username, password, name, email, role='user'):
    user = User(username, password, name, email, role)
    user.save()


def login(username, password):
    response = request('POST', '/api/login', json={'username': username, 'password': password})

    return response.get_json()


def test_register_user_returns_new_user():
    response = request('POST', '/api/register',
                       json={'username': 'test',
                             'password': 'test',
                             'name': 'test test',
                             'email': 'test'}).get_json()

    assert "user" in response


def test_register_user_with_insufficient_data_returns_error():
    response = request('POST', '/api/register',
                       json={'username': 'test',
                                        'password': 'test',
                                        'name': 'test test'}).get_json()

    assert "message" in response


def test_login_with_registered_user_returns_token():
    create_user('test', 'test', 'test test', 'test')
    response = login('test', 'test')

    assert 'token' in response


def test_login_without_registered_user_returns_error():
    response = login('test', 'test')

    assert 'error' in response


def test_get_current_user_returns_correct_user():
    create_user('test', 'test', 'test test', 'test')
    response = login('test', 'test')

    curr_user_response = request("GET", "/api/current-user", token=response['token']).get_json()

    assert 'user' in curr_user_response


def test_access_private_route_without_token_returns_error():
    response = request("GET", "/api/current-user").get_json()
    
    assert 'error' in response


def test_access_private_route_without_permission_returns_error():
    create_user('test', 'test', 'test test', 'test')
    response = login('test', 'test')

    users = request("GET", '/api/users', token=response['token']).get_json()

    assert 'error' in users


def test_access_private_route_with_permissions_returns_correct_data():
    create_user('test', 'test', 'test test', 'test', role='admin')
    response = login('test', 'test')

    users = request("GET", '/api/users', token=response['token']).get_json()

    assert 'users' in users


def test_update_user_updates_user():
    create_user('test', 'test', 'test test', 'test', role='admin')
    response = login("test", "test")

    response = request('PUT', '/api/users/1',
                       json={'username': 'test1',
                            'password': 'test',
                            'name': 'test test',
                            'email': 'test',
                            'role': 'admin'}, token=response['token']).get_json()

    assert 'test1' == response['user']['username']


def test_delete_user_deletes_user():
    create_user('test', 'test', 'test test', 'test', role='admin')
    create_user('test1', 'test1', 'test test1', 'test1')

    response = login("test", "test")

    response = request('DELETE', '/api/users/2',
                       token=response['token'])

    assert response.status_code == 204