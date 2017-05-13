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
