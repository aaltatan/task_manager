from flask import Flask, render_template, request
import sqlite3
import json


def delete_task(id):
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("""
    UPDATE tasks
    SET is_deleted = 1
    WHERE tasks.id = ?;
    """,(id,))
    db.commit()
    db.close()

def add_new_task(data: dict):
    """ Add new task and its subtasks to Database """
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    id, title, creation_date, last_update_date, is_deleted = list(data.values())[
        :-1]
    
    cr.execute("SELECT id FROM tasks WHERE is_deleted = 0")
    ids = cr.fetchall()
    ids = [i[0] for i in ids]
    criteria = int(id) in ids

    if criteria:
        cr.execute("""
        DELETE FROM tasks WHERE tasks.id = ?;
        """,(id,))
        cr.execute("""
        DELETE FROM subtasks WHERE subtasks.task_id = ?;
        """,(id,))
    
    cr.execute("""
    INSERT INTO tasks(id,title,creation_date,last_update_date,is_deleted) VALUES (?,?,?,?,?)
               """, (id, title, creation_date, last_update_date, is_deleted))
    for subtask in list(data.values())[-1]:
        subtask_id, title, is_checked, is_deleted = list(subtask.values())
        cr.execute("""
            INSERT INTO subtasks(task_id,id,title,is_checked,is_deleted) VALUES (?,?,?,?,?)
        """, (id, subtask_id, title, is_checked, is_deleted))
    db.commit()
    db.close()

def get_task_subtasks(id):
    """ get sepecific main task and subtask data"""
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("""
    SELECT tasks.id,tasks.title,subtasks.title,subtasks.is_checked
	FROM tasks 
	LEFT JOIN subtasks ON subtasks.task_id = tasks.id
	WHERE tasks.id = ? AND tasks.is_deleted = 0;
    """, (id,))
    data = cr.fetchall()
    db.commit()
    db.close()
    return data


def get_last_entry() -> int:
    """ Get last entry id"""
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("SELECT id FROM tasks ORDER BY tasks.id DESC LIMIT 1")
    request = cr.fetchall()
    db.close()
    return request[0][0] if request else 0


def get_main_tasks() -> dict:
    "get all main tasks"
    db = sqlite3.connect("./data/app.db")
    cr = db.cursor()
    cr.execute("SELECT id,title FROM tasks WHERE is_deleted = 0")
    data = cr.fetchall()
    db.close()
    return data if data else []



app = Flask(__name__)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/add-data", methods=["POST"])
def add_data():
    response = request.get_data()
    data = json.loads(response)
    add_new_task(data)
    return ("New Task has been added")


@app.route("/api/delete-data", methods=["POST"])
def delete_data():
    response = request.get_data()
    data = json.loads(response)
    print("#"*20)
    print(data)
    print("#"*20)
    id = data["data"]
    delete_task(id)
    return ("New Task has been Deleted")


@app.route("/api/lr")
def get_last_id():
    data = {
        "id": get_last_entry() + 1
    }
    return json.dumps(data)


@app.route("/api/getmaintasks")
def get_main_data():
    data = get_main_tasks()
    data = {"data": data}
    return json.dumps(data)


@app.route("/api/gettask", methods=["POST"])
def get_specific_task():
    id = request.get_json()["id"]
    data = {"data": get_task_subtasks(id)}
    return json.dumps(data)


if __name__ == "__main__":
    app.run(debug=True, port=8000)
