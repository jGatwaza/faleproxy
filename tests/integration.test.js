const request = require('supertest');
const cheerio = require('cheerio');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');

describe('Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    // Clear the require cache to get a fresh app instance
    delete require.cache[require.resolve('../app.js')];
    
    // Mock external HTTP requests
    nock.cleanAll();
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    // Setup mock for example.com
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);
    
    // Get a fresh app instance
    app = require('../app.js');
    
    // Make a request to our proxy app
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://example.com/' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    
    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.body.content);
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');
    
    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);
    
    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should handle invalid URLs', async () => {
    // Get a fresh app instance
    app = require('../app.js');
    
    await request(app)
      .post('/fetch')
      .send({ url: 'not-a-valid-url' })
      .expect(500);
  });

  test('Should handle missing URL parameter', async () => {
    // Get a fresh app instance
    app = require('../app.js');
    
    const response = await request(app)
      .post('/fetch')
      .send({})
      .expect(400);
    
    expect(response.body.error).toBe('URL is required');
  });
});
