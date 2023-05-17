const path = require('path');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5050;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', require('./routes/root'));

// Api Endpoints
app.use('/requests', require('./routes/api/userRequests'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
