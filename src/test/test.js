
import request from 'supertest';
import jest from 'jest';

import app from '../index';

let token = "";

describe('New User', () => {
  it('new user - bad password', async () => {    
    const res = await request(app)
      .post('/api/signup')
      .send({
        username: "test123",
        password: '12345',
      });
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.text)).toMatchObject({
      "code": "110"
    });
  });

  it('new user - valid password', async () => {    
    const res = await request(app)
      .post('/api/signup')
      .send({
        username: "test123",
        password: '123456',
      });
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.text)).toMatchObject({
      "code": "0"
    });
  });
});

describe('User Sign On', () => {
  it('sign on - bad password', async () => {    
    const res = await request(app)
      .post('/api/signon')
      .send({
        username: "test123",
        password: '12345',
      });
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.text)).toMatchObject({
      "code": "100"
    });
  });

  it('sign on - valid password', async () => {    
    const res = await request(app)
      .post('/api/signon')
      .send({
        username: "test123",
        password: '123456',
      });
    token = JSON.parse(res.text).payload;
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.text)).toMatchObject({
      "code": "0"
    });
  });


  it('sign on - session is not expired', async () => {    
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', token)
      .send();
    
    expect(res.statusCode).toEqual(200)
    expect(JSON.parse(res.text)).toMatchObject({
      "code": "0"
    });
  });

  it('sign on - session is expired', async () => {    
    console.log("wait for session timeout...")
    setTimeout(async () => {
      const res = await request(app)      
        .get('/api/posts')
        .set('Authorization', token)
        .send();
      
      expect(res.statusCode).toEqual(200)
      expect(JSON.parse(res.text)).toMatchObject({
        "code": "101"
      });
    }, 10000);
  });  
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});