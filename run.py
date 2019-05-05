from server.main import app, api
from server.views import *
from server.api import *


api.add_resource(LoginEndpoint, '/login')
api.add_resource(RegisterEndpoint, '/register')
api.add_resource(CurrentUserEndpoint, '/current-user')
api.add_resource(UsersEndpoint, '/users')
api.add_resource(UserEndpoint, '/users/<user_id>')
api.add_resource(UserWorkEntriesEndpoint, '/work-entries/<user_id>')
api.add_resource(WorkEntryEndpoint, '/work-entries/<work_entry_id>')

if __name__ == '__main__':
    app.run(host='0.0.0.0')
