const request = require('supertest')
const app = require('../src/server')

describe('All Testing', () => {
  it('Test museums and exhibitions', async () => {

    /// GET all museums
    var res = await request(app).get('/api/museums');
    expect(res.statusCode).toEqual(200);
    const museums = res.body;
    expect(museums).toBeDefined();
    expect(Array.isArray(museums)).toBeTruthy(); 
    expect(museums.length).toBeGreaterThan(0);
    museums.forEach(museum => {
      expect(museum).toHaveProperty('id');
      expect(museum).toHaveProperty('name');
      expect(museum).toHaveProperty('location');
      expect(museum).toHaveProperty('revenue');
    });

    /// GET museum by id
    const res2 = await request(app).get('/api/museum/1');
    const museum = res2.body;
    expect(museum).toBeDefined();
    expect(museum).toHaveProperty('id');
    expect(museum).toHaveProperty('name');
    expect(museum).toHaveProperty('location');
    expect(museum).toHaveProperty('revenue');
    expect(museum.id).toEqual(1);
    expect(museum.name).toEqual('Museum of Chocolate');
    expect(museum.location).toEqual('Brussels');
    expect(museum.revenue).toEqual(250000);
    expect(res2.statusCode).toEqual(200);
    const ress2 = await request(app).get('/api/museum/100');
    expect(ress2.statusCode).toEqual(401);

    /// DELETE museum
    const res3 = await request(app).delete('/api/museum/delete/8');
    expect(res3.statusCode).toEqual(200);
    const res4 = await request(app).delete('/api/museum/delete/1000');
    expect(res4.statusCode).toEqual(401);
    const res5 = await request(app).delete('/api/museum/delete/8');
    expect(res5.statusCode).toEqual(401);
    const resn = await request(app).post('/api/museum/add/Museum-of-Illusions&Budapest&980000')
    expect(resn.statusCode).toEqual(200);

    /// ADD museum
    const res6 = await request(app).post('/api/museum/add/&def&123');
    expect(res6.statusCode).toEqual(401);
    const res7 = await request(app).post('/api/museum/add/abc&&123');
    expect(res7.statusCode).toEqual(402);
    const res8 = await request(app).post('/api/museum/add/abc&def&');
    expect(res8.statusCode).toEqual(403);
    const res9 = await request(app).post('/api/museum/add/abc&def&-123');
    expect(res9.statusCode).toEqual(403);
    const res10 = await request(app).post('/api/museum/add/Museum-of-Illusions&Budapest&980000');
    expect(res10.statusCode).toEqual(405);
    const res11 = await request(app).post('/api/museum/add/abc&def&123');
    expect(res11.statusCode).toEqual(200);
    const res12 = await request(app).delete('/api/museum/delete/10');
    expect(res12.statusCode).toEqual(200);

    const res13 = await request(app).post('/api/museum/add/abc&def&123');
    expect(res13.statusCode).toEqual(200);

    /// EDIT museum
    const res16 = await request(app).put('/api/museum/edit/a/xyz&xyz&123');
    expect(res16.statusCode).toEqual(400);
    const res17 = await request(app).put('/api/museum/edit/11/&xyz&123');
    expect(res17.statusCode).toEqual(401);
    const res28 = await request(app).put('/api/museum/edit/11/abc&&123');
    expect(res28.statusCode).toEqual(402);
    const res18 = await request(app).put('/api/museum/edit/11/abc&def&');
    expect(res18.statusCode).toEqual(403);
    const res19 = await request(app).put('/api/museum/edit/11/abc&def&-123');
    expect(res19.statusCode).toEqual(403);
    const res20 = await request(app).put('/api/museum/edit/11/Museum-of-Illusions&Budapest&980000');
    expect(res20.statusCode).toEqual(405);
    const res23 = await request(app).put('/api/museum/edit/8/xyz&xyz&123');
    expect(res23.statusCode).toEqual(406);
    const res21 = await request(app).put('/api/museum/edit/11/xyz&xyz&123');
    expect(res21.statusCode).toEqual(200);
    const ress = await request(app).get('/api/museum/11');
    const museum2 = ress.body;
    expect(museum2).toBeDefined();
    expect(museum2).toHaveProperty('id');
    expect(museum2).toHaveProperty('name');
    expect(museum2).toHaveProperty('location');
    expect(museum2).toHaveProperty('revenue');
    expect(museum2.id).toEqual(11);
    expect(museum2.name).toEqual('xyz');
    expect(museum2.location).toEqual('xyz');
    expect(museum2.revenue).toEqual(123);
    expect(ress.statusCode).toEqual(200);
    const res22 = await request(app).delete('/api/museum/delete/11');
    expect(res22.statusCode).toEqual(200);

    /// GET all exhibition
    res = await request(app).get('/api/exhibitions');
    expect(res.statusCode).toEqual(200);
    var exhibitions = res.body;
    expect(exhibitions).toBeDefined();
    expect(Array.isArray(exhibitions)).toBeTruthy(); 
    expect(exhibitions.length).toBeGreaterThan(0);
    exhibitions.forEach(exh => {
      expect(exh).toHaveProperty('id');
      expect(exh).toHaveProperty('name');
      expect(exh).toHaveProperty('descr');
      expect(exh).toHaveProperty('price');
      expect(exh).toHaveProperty('mid');
    });

    /// GET exhibition by id
    res = await request(app).get('/api/exhibition/1');
    var exhibition = res.body;
    expect(exhibition).toBeDefined();
    expect(exhibition).toHaveProperty('id');
    expect(exhibition).toHaveProperty('name');
    expect(exhibition).toHaveProperty('descr');
    expect(exhibition).toHaveProperty('price');
    expect(exhibition).toHaveProperty('mid');
    expect(exhibition.id).toEqual(1);
    expect(exhibition.name).toEqual('History of Chocolate Making');
    expect(exhibition.descr).toEqual('Explore the rich history of chocolate making from ancient civilizations to modern times.');
    expect(exhibition.price).toEqual(10);
    expect(exhibition.mid).toEqual(1);
    expect(res.statusCode).toEqual(200);
    res = await request(app).get('/api/exhibition/100');
    expect(res.statusCode).toEqual(401);

    /// DELETE exhibition
    res = await request(app).delete('/api/exhibition/delete/1');
    expect(res.statusCode).toEqual(200);
    res = await request(app).delete('/api/exhibition/delete/1000');
    expect(res.statusCode).toEqual(401);
    res = await request(app).delete('/api/exhibition/delete/1');
    expect(res.statusCode).toEqual(401);
    res = await request(app).post('/api/exhibition/add/International-Chocolate-Tasting&Best-Chocolate-Tasting!&20&1')
    expect(res.statusCode).toEqual(200);

    /// ADD exhibition
    res = await request(app).post('/api/exhibition/add/&def&123&1');
    expect(res.statusCode).toEqual(401);
    res = await request(app).post('/api/exhibition/add/abc&&123&1');
    expect(res.statusCode).toEqual(402);
    res = await request(app).post('/api/exhibition/add/abc&def&&1');
    expect(res.statusCode).toEqual(403);
    res = await request(app).post('/api/exhibition/add/abc&def&-123&1');
    expect(res.statusCode).toEqual(403);
    res = await request(app).post('/api/exhibition/add/International-Chocolate-Tasting&Best-Chocolate-Tasting!&20&1');
    expect(res.statusCode).toEqual(405);
    res = await request(app).post('/api/exhibition/add/Best-Exhibition&Ever!&30&100');
    expect(res.statusCode).toEqual(406);
    res = await request(app).post('/api/exhibition/add/abc&def&123&1');
    expect(res.statusCode).toEqual(200);
    res = await request(app).delete('/api/exhibition/delete/14');
    expect(res.statusCode).toEqual(200);

    res = await request(app).post('/api/exhibition/add/abc&def&123&1');
    expect(res.statusCode).toEqual(200);

    /// EDIT exhibition
    res = await request(app).put('/api/exhibition/edit/a/xyz&xyz&123&1');
    expect(res.statusCode).toEqual(400);
    res = await request(app).put('/api/exhibition/edit/15/&xyz&123&1');
    expect(res.statusCode).toEqual(401);
    res = await request(app).put('/api/exhibition/edit/15/abc&&123&1');
    expect(res.statusCode).toEqual(402);
    res = await request(app).put('/api/exhibition/edit/15/abc&def&&1');
    expect(res.statusCode).toEqual(403);
    res = await request(app).put('/api/exhibition/edit/15/abc&def&-123&1');
    expect(res.statusCode).toEqual(403);
    res = await request(app).put('/api/exhibition/edit/15/abc&def&123&100');
    expect(res.statusCode).toEqual(405);
    res = await request(app).put('/api/exhibition/edit/15/International-Chocolate-Tasting&Best-Chocolate-Tasting!&20&1');
    expect(res.statusCode).toEqual(406);
    res = await request(app).put('/api/exhibition/edit/16/xyz&xyz&123&1');
    expect(res.statusCode).toEqual(407);
    res = await request(app).put('/api/exhibition/edit/15/xyz&xyz&123&1');
    expect(res.statusCode).toEqual(200);
    res = await request(app).get('/api/exhibition/15');
    exhibition = res.body;
    expect(exhibition).toBeDefined();
    expect(exhibition).toHaveProperty('id');
    expect(exhibition).toHaveProperty('name');
    expect(exhibition).toHaveProperty('descr');
    expect(exhibition).toHaveProperty('price');
    expect(exhibition).toHaveProperty('mid');
    expect(exhibition.id).toEqual(15);
    expect(exhibition.name).toEqual('xyz');
    expect(exhibition.descr).toEqual('xyz');
    expect(exhibition.price).toEqual(123);
    expect(exhibition.mid).toEqual(1);
    expect(res.statusCode).toEqual(200);
    res = await request(app).delete('/api/exhibition/delete/15');
    expect(res.statusCode).toEqual(200);
  })
})