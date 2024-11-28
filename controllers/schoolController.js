const db = require('../config/db');
const calculateDistance = require('../utils/distanceCalculator');

exports.addSchool = async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, parseFloat(latitude), parseFloat(longitude)]
        );
        res.status(201).json({ message: 'School added successfully.', schoolId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

exports.listSchools = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    try {
        const [schools] = await db.execute('SELECT * FROM schools');
        const userLatitude = parseFloat(latitude);
        const userLongitude = parseFloat(longitude);

        const sortedSchools = schools.map((school) => ({
            ...school,
            distance: calculateDistance(userLatitude, userLongitude, school.latitude, school.longitude),
        })).sort((a, b) => a.distance - b.distance);

        res.status(200).json(sortedSchools);
    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};
