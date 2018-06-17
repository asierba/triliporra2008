import expect from 'expect.js';
import * as stubRepository from "./helpers/stubRepository";
import mockery from "mockery";
import request from "supertest";
import createTestServer from './helpers/createTestServer';

describe('user', () => {
  let server;

  const allMatches = [{
    id: 1,
    date: "2018-06-14T15:00:00Z",
    home: "Catalunya",
    away: "Euskal Herria",
    stage: "fictional match"
  },
    {
      id: 2,
      date: "2018-06-15T15:00:00Z",
      home: "Wales",
      away: "Italy",
      stage: "a match"
    }];


  beforeEach(() => {
    mockery.enable();
    mockery.warnOnUnregistered(false);
    mockery.registerMock('../repository', stubRepository);


    server = createTestServer();

    stubRepository.setMatches(allMatches);
  });

  afterEach(() => {
    server.close();
    mockery.deregisterMock('../repository');
    mockery.disable();
  });

  it('should have user id', () =>
    request(server)
      .get('/api/user/5')
      .then(response => response.body)
      .then(body => {
        expect(body.properties.id).to.eql(5);
      }));

  it('should have matches', () =>
    request(server)
      .get('/api/user/5')
      .then(response => response.body)
      .then(body => {
        expect(body.properties.matches).to.eql(allMatches);
      }));

  it('should have action to update match prediction', () =>
    request(server)
      .get('/api/user/5')
      .then(response => response.body)
      .then(body => {
        expect(body.actions).to.eql([
          {
            "name": "predict match",
            "method": "PATCH",
            "href": "/api/user/5/match" // TODO URL
          }
        ]);
      }));

  it('should be able to introduce a match prediction', () =>
    request(server)
      .patch('/api/user/5/match/1')
      .send({ prediction: "away"})
      .expect(204)
      .then(() =>
        stubRepository.getAll('match-prediction').then(matchPredictions =>
          expect(matchPredictions.find(x => x.userId === 5).prediction).to.eql("away"))));


  describe('with match predictions', () => {
    beforeEach(() => {
      const matchPredictions = [
        { matchId: 1, prediction: 'away', userId: 1},
        { matchId: 2, prediction: 'away', userId: 2},
        { matchId: 1, prediction: 'home', userId: 5},
        { matchId: 2, prediction: 'draw', userId: 5},
      ];
      stubRepository.setPredictions(matchPredictions);
    });

    it('should have match predictions for that user', () =>
      request(server)
        .get('/api/user/5')
        .then(response => response.body.properties.matches)
        .then(matches => {
          expect(matches).to.eql([{
            id: 1,
            date: "2018-06-14T15:00:00Z",
            home: "Catalunya",
            away: "Euskal Herria",
            stage: "fictional match",
            prediction: 'home'
          },
            {
              id: 2,
              date: "2018-06-15T15:00:00Z",
              home: "Wales",
              away: "Italy",
              stage: "a match",
              prediction: 'draw'
            }]);
        }));

    it('should be able to update a match prediction', () =>
      request(server)
        .patch('/api/user/5/match/1')
        .send({ prediction: "away"})
        .expect(204)
        .then(() =>
          stubRepository.getAll('match-prediction').then(matchPredictions =>
            expect(matchPredictions.find(x => x.userId === 5).prediction).to.eql("away"))));
  });
});
