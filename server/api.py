import datetime
from functools import wraps


from flask import jsonify, request, make_response
from flask_restful import Resource, reqparse
from flask_jwt_extended import (create_access_token, get_jwt_identity,
                                jwt_required, get_jwt_claims, verify_jwt_in_request)
from sqlalchemy.exc import IntegrityError

from .main import jwt, api
from .models import User, WorkEntry


@jwt.unauthorized_loader
def unauthorized_response(callback):
    return jsonify({
        'error': 'Missing Authorization Header'
    }), 401


@jwt.expired_token_loader
def expired_token_callback(expired_token):
    return jsonify({
        'error': 'The token has expired',
        'expiredToken': True
    }), 401


@jwt.user_claims_loader
def add_claims_to_access_token(user):
    return {'role': user.role, 'user_id': str(user.user_id)}


@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.username


def can_access(fn):
    """
    Helper method which checks if user have proper right to access url.
    User can't edit/delete other user record except if user is admin.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()

        user_id_from_url = kwargs['user_id']
        claims = get_jwt_claims()
        if claims['user_id'] != user_id_from_url and claims['role'] != 'admin':
            return json_response({'error': "You don't have permission for this action!"}, 403)
        else:
            return fn(*args, **kwargs)

    return wrapper


@api.representation('application/json')
def json_response(data, code, headers=None):
    """Makes a Flask response with a JSON encoded body"""
    resp = make_response(jsonify(data), code)
    resp.headers.extend(headers or {})
    return resp


def non_empty_string(s):
    if not s:
        raise ValueError("Must not be empty string")
    return s


class LoginEndpoint(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser(bundle_errors=True)
        self.parser.add_argument(
            'username', type=non_empty_string, required=True, help="No username provided", location="json"
        )
        self.parser.add_argument(
            'password', type=non_empty_string, required=True, help="No password provided", location="json"
        )

        super(LoginEndpoint, self).__init__()

    def post(self):
        data = self.parser.parse_args()

        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            token = create_access_token(identity=user)

            return json_response({'token': token}, 200)

        return json_response({'error': 'Wrong username or password!'}, 400)


class RegisterEndpoint(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser(bundle_errors=True)
        self.parser.add_argument(
            'username', type=non_empty_string, required=True, help="No username provided", location="json"
        )
        self.parser.add_argument(
            'password', type=non_empty_string, required=True, help="No password provided", location="json"
        )
        self.parser.add_argument(
            'name', type=non_empty_string, required=True, help="No name provided", location="json"
        )
        self.parser.add_argument(
            'email', type=non_empty_string, required=True, help="No email provided", location="json"
        )

        super(RegisterEndpoint, self).__init__()

    def post(self):
        data = self.parser.parse_args()

        user = User(username=data['username'], password=data['password'],
                    name=data['name'], email=data['email'])

        try:
            user.save()
        except IntegrityError as e:
            app.logger.info(e)
            user.rollback()
            return json_response({'error': 'Username has to be unique!'}, 400)

        return json_response({'user': dict(user)}, 200)


class CurrentUserEndpoint(Resource):

    @jwt_required
    def get(self):
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        return json_response({'user': dict(user)}, 200)


class UsersEndpoint(Resource):

    @jwt_required
    def get(self):
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        if user.role == 'user':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        return json_response({'users': [dict(user) for user in User.query.all()]}, 200)


class UserEndpoint(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser(bundle_errors=True)
        self.parser.add_argument(
            'prefferedWorkingHourPerDay',
            type=int, location="json"
        )
        self.parser.add_argument(
            'email',
            type=non_empty_string, required=True, help="No email provided", location="json"
        )
        self.parser.add_argument(
            'username',
            type=non_empty_string, required=True, help="No username provided", location="json"
        )
        self.parser.add_argument(
            'name',
            type=non_empty_string, required=True, help="No name provided", location="json"
        )
        self.parser.add_argument(
            'role',
            choices=('admin', 'user', 'user-manager'), required=True, help="No role provided", location="json"
        )

        super(UserEndpoint, self).__init__()

    @jwt_required
    def get(self, user_id):
        username = get_jwt_identity()
        token_user = User.query.filter_by(username=username).first()

        user = User.query.get(user_id)

        if token_user.user_id != user.user_id and token_user.role == 'user':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        return json_response({'user': dict(user)}, 200)

    @jwt_required
    def put(self, user_id):
        data = self.parser.parse_args()

        username = get_jwt_identity()
        token_user = User.query.filter_by(username=username).first()

        user = User.query.get(user_id)

        if token_user.user_id != user.user_id and token_user.role == 'user':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        user.preffered_working_hour_per_day = data['prefferedWorkingHourPerDay']
        user.email = data['email']
        user.username = data['username']
        user.name = data['name']
        user.role = data['role']
        user.save()

        return json_response({'user': dict(user)}, 200)

    @jwt_required
    def delete(self, user_id):
        username = get_jwt_identity()
        token_user = User.query.filter_by(username=username).first()

        user = User.query.get(user_id)

        if token_user.user_id != user.user_id and token_user.role == 'user':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        user.delete()

        return json_response([], 204)


class UserWorkEntriesEndpoint(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser(bundle_errors=True)
        self.parser.add_argument(
            'date', type=lambda x: datetime.datetime.strptime(str(x), '%d/%m/%Y'),
            required=True, help="No date provided", location="json"
        )
        self.parser.add_argument(
            'hours', type=int, required=True, help="No hours provided", location="json"
        )
        self.parser.add_argument(
            'notes', type=str, location="json"
        )

        super(UserWorkEntriesEndpoint, self).__init__()

    @can_access
    def get(self, user_id):
        user = User.query.get(user_id)

        if request.args:
            args = request.args
            if args['start_date'] and args['end_date']:
                start_date = datetime.datetime.strptime(
                    args['start_date'], "%d/%m/%Y")
                end_date = datetime.datetime.strptime(
                    args['end_date'], "%d/%m/%Y")

                return json_response(
                    {'workEntries': [dict(work_entry)
                                     for work_entry in user.work_entries if work_entry.date >= start_date.date() and work_entry.date <= end_date.date()]},
                    200
                )

        return json_response(
            {'workEntries': [dict(work_entry)
                             for work_entry in user.work_entries]},
            200
        )

    @can_access
    def post(self, user_id):
        data = self.parser.parse_args()
        user = User.query.get(user_id)

        work_entry = WorkEntry(
            data['date'], data['hours'], data.get('notes', ""))

        user.work_entries.append(work_entry)
        user.save()

        return json_response({'workEntry': dict(work_entry)}, 200)


class WorkEntryEndpoint(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser(bundle_errors=True)
        self.parser.add_argument(
            'date', type=lambda x: datetime.datetime.strptime(str(x), '%d/%m/%Y'),
            required=True, help="No date provided", location="json"
        )
        self.parser.add_argument(
            'hours', type=int, required=True, help="No hours provided", location="json"
        )
        self.parser.add_argument(
            'notes', type=str, location="json"
        )

        super(WorkEntryEndpoint, self).__init__()

    @jwt_required
    def put(self, work_entry_id):
        data = self.parser.parse_args()

        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        work_entry = WorkEntry.query.get(work_entry_id)
        if work_entry.user_id != user.user_id and user.role != 'admin':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        work_entry.date = data['date']
        work_entry.hours = data['hours']
        work_entry.notes = data.get('notes', "")

        work_entry.save()

        return json_response({'workEntry': dict(work_entry)}, 200)

    @jwt_required
    def delete(self, work_entry_id):
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        work_entry = WorkEntry.query.get(work_entry_id)
        if work_entry.user_id != user.user_id and user.role != 'admin':
            return json_response({'error': "You don't have permission for this action!"}, 403)

        work_entry.delete()

        return json_response([], 204)
