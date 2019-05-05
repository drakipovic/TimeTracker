from flask import render_template, jsonify

from .main import app


@app.route('/')
def index():
    return render_template('index.html')
