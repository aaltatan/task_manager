CREATE TABLE tasks (
	id INTEGER PRIMARY KEY,
	title TEXT NOT NULL,
	creation_date TEXT NOT NULL,
	last_update_date TEXT NOT NULL,
	is_deleted INTEGER
);
CREATE TABLE subtasks (
	task_id INTEGER NOT NULL,
	id INTEGER NOT NULL,
	title TEXT,
	is_checked INTEGER,
	is_deleted INTEGER,
	FOREIGN KEY (task_id) REFERENCES tasks (id)
);