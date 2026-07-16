import request from "supertest";
import app from "../src/index.js";

describe("Nova-Shop API Testing", () => {
  test("GET / should return 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  test("login should fail if email is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "123456",
    });
    expect(res.statusCode).toBe(400);
  });

  test("login should fail if password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@gmail.com",
    });
    expect(res.statusCode).toBe(400);
  });

  test("login should fail if both fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.statusCode).toBe(400);
  });

  test("register should fail if name is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test@gmail.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(400);
  });

  test("register should fail if email is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Priya",
      password: "123456",
    });
    expect(res.statusCode).toBe(400);
  });

  test("register should fail if password is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Priya",
      email: "test@gmail.com",
    });
    expect(res.statusCode).toBe(400);
  });

  test("invalid route should return 404", async () => {
    const res = await request(app).get("/wrong-route");
    expect(res.statusCode).toBe(404);
  });

  test("intentional fail: home route should return 201", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(201);
  });

  test("intentional fail: wrong route should return 200", async () => {
    const res = await request(app).get("/wrong-route");
    expect(res.statusCode).toBe(200);
  });
});