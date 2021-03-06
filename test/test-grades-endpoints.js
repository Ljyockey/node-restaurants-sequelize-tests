const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const should = chai.should();
const app = require('../app');
const {Grade, Restaurant} = require('../models');

chai.use(chaiHttp);

function generateGradeData(includeDates=false, restaurantId=null) {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  const grade = grades[Math.floor(Math.random() * grades.length)];
  const result = {
    inspectionDate: faker.date.past(),
    grade: grade
  };
  if (includeDates) {
    const date = faker.date.recent();
    result.createdAt = date;
    result.updatedAt = date;
  }
  if (restaurantId) {
    result.restaurant_id = restaurantId;
  }
  return result;
}

function seedData(seedNum=1) {
  return seedRestaurantData()
    .then(restaurant => {
      const promises = [];
      for (let i=1; i<=seedNum; i++) {
        console.log(restaurant.id);
        promises.push(Grade.create(generateGradeData(true, restaurant.id)));
      }
      return Promise.all(promises);
    });
}

function seedRestaurantData() {
  const date = faker.date.recent();
  return Restaurant.create({
    name: faker.company.companyName(),
    borough: 'Queens',
    cuisine: 'Mexican',
    addressBuildingNumber: faker.address.streetAddress(),
    addressStreet: faker.address.streetName(),
    addressZipcode: faker.address.zipCode(),
    createdAt: date,
    updatedAt: date});
}

describe('Grades API resource', function() {

	beforeEach(function() {
		return Grade
		.truncate({cascade: true})
		.then(() => seedData());
	});

	describe('GET by ID', function() {

		it('should return grade with corresponding ID', function() {
			let grade;
			return Grade
  			.findOne()
  			.then(_grade => {
  				grade = _grade
  				return chai.request(app)
				    .get(`/grades/${grade.id}`);
			})
			.then(res => {
				res.should.have.status(200);
				res.body.id.should.equal(grade.id);
			})
		});
	});

  describe('POST endpoint', function() {

    it('should post a new grade', function() {

      let restaurant;
      const newGrade = generateGradeData();
      newGrade.score = 12;

      return Restaurant.findOne()
        .then(_restaurant => {
          restaurant = _restaurant;
          newGrade.restaurant_id = restaurant.id;
          return chai.request(app)
            .post('/grades').send(newGrade)
        })
        .then(res => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.keys('grade', 'score', 'id', 'inspectionDate');
        });
    });
  });

  describe('PUT endpoints', function() {

    it('should update a grade', function() {

      const toUpdate = {
        grade: 'Z',
        score: '2000',
        inspectionDate: Date.now()
      };

      return Grade.findOne()
        .then(function(grade)  {
          toUpdate.id = grade.id;
          return chai.request(app)
            .put(`/grades/${grade.id}`).send(toUpdate);
        })
        then(res => {
          res.should.have.status(204);
          return Grade.findById(toUpdate.id)
        })
        .then(function(grade) {
          grade.grade.should.equal(toUpdate.grade);
          grade.score.should.equal(toUpdate.score);
        });
    });
  });

  describe('DELETE endpoint', function() {

    it('should delete grade', function() {
      let grade;
      return Grade.findOne()
      .then(function(_grade) {
        grade = _grade;
        return chai.request(app)
        .delete(`/grades/${grade.id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
        return Grade.findById(grade.id)
      })
      .then(function(_grade) {
        should.not.exist(_grade);
      });
    });
  });

});