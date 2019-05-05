from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from .main import db


class Base(db.Model):
    __abstract__ = True

    created_on = db.Column(db.DateTime, default=db.func.now())
    updated_on = db.Column(
        db.DateTime, default=db.func.now(), onupdate=db.func.now())

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def rollback(self):
        db.session.rollback()


class User(Base):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    preffered_working_hour_per_day = db.Column(db.Integer)

    work_entries = db.relationship('WorkEntry', backref='user', lazy='select')

    def __init__(self, username, password, name, email, role='user'):
        self.username = username
        self.password_hash = self._set_password(password)
        self.name = name
        self.role = role
        self.email = email

    def __iter__(self):
        yield 'id', str(self.user_id)
        yield 'name', self.name,
        yield 'username', self.username
        yield 'email', self.email
        yield 'role', self.role
        yield 'prefferedWorkingHourPerDay', self.preffered_working_hour_per_day

    def _set_password(self, password):
        return generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class WorkEntry(Base):
    __tablename__ = 'work_entries'

    work_entry_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    hours = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text)

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))

    def __init__(self, date, hours, notes):
        self.date = date
        self.hours = hours
        self.notes = notes

    def __iter__(self):
        yield 'id', self.work_entry_id
        yield 'date', datetime.strftime(self.date, "%d/%m/%Y")
        yield 'hours', self.hours
        yield 'notes', self.notes
