const request = require('supertest');
const express = require('express');
const fs = require('fs');
const TODOS_FILE = 'todos.json';

let app;
beforeEach(() => {
  app = require('./app');
});

describe('To-Do List API', () => {
  beforeEach(() => {
    // Clear todos.json before each test
    if (fs.existsSync(TODOS_FILE)) fs.unlinkSync(TODOS_FILE);
    app = require('./app');
  });

  it('should add a new todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Test todo' });
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Test todo');
    expect(res.body.done).toBe(false);
  });

  it('should get all todos', async () => {
    await request(app).post('/todos').send({ text: 'Test todo' });
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a todo', async () => {
    const addRes = await request(app).post('/todos').send({ text: 'Update me' });
    const id = addRes.body.id;
    const updateRes = await request(app).put(`/todos/${id}`).send({ text: 'Updated', done: true });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.text).toBe('Updated');
    expect(updateRes.body.done).toBe(true);
  });

  it('should mark a todo as done and undone', async () => {
    const addRes = await request(app).post('/todos').send({ text: 'Mark me' });
    const id = addRes.body.id;
    await request(app).put(`/todos/${id}`).send({ done: true });
    let getRes = await request(app).get('/todos');
    expect(getRes.body[0].done).toBe(true);
    await request(app).put(`/todos/${id}`).send({ done: false });
    getRes = await request(app).get('/todos');
    expect(getRes.body[0].done).toBe(false);
  });

  it('should delete a todo', async () => {
    const addRes = await request(app).post('/todos').send({ text: 'Delete me' });
    const id = addRes.body.id;
    const delRes = await request(app).delete(`/todos/${id}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.id).toBe(id);
    const getRes = await request(app).get('/todos');
    expect(getRes.body.find(t => t.id === id)).toBeUndefined();
  });

  it('should persist todos to file', async () => {
    await request(app).post('/todos').send({ text: 'Persist me' });
    expect(fs.existsSync(TODOS_FILE)).toBe(true);
    const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'));
    expect(Array.isArray(data.todos)).toBe(true);
    expect(data.todos[0].text).toBe('Persist me');
  });
}); 