const express = require('express');
const router = express.Router();

const {Restaurant, Grade} = require('../models');

router.get('/:id', (req, res) => Grade.findById(req.params.id, {
	include: [{
		model: Restaurant,
		as: 'restaurant'}]
})
.then(grades => res.json({
	grades: grades.map(grades => grades.apiRepr())
}))
);

router.post('/', (req, res) => {
	const requiredFields = ['grade', 'inspectionDate', 'score', 'restaurant_id'];
	for (let i=0; i< requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing ${field} in req.body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	return Grade.create({
		grade: req.body.grade,
		inspectionDate: req.body.inspectionDate,
		restaurant_id: req.body.restaurant_id,
		score: req.body.score
	})
	.then(grade => res.status(201).json(grade.apiRepr()))
	.catch(err => res.status(500).send({message: err.message}));
});

router.put('/:id', (req, res) => {
	if (req.params.id !== req.body.id) {
		const message = 'req.params.id and req.body.id must match';
		console.error(message);
		res.status(400).send(message);
	}
	const toUpdate = {};
	const possibleFields = ['grade', 'score', 'inspectionDate'];
	possibleFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});
	return Grade.update(toUpdate, {
		where: {id: req.params.id}
	})
	.then(grade => res.status(204).end())
	.catch(err => res.status(500).json({message: 'internal server error'}));
});