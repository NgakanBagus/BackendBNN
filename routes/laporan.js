const express = require('express');
const router = express.Router();
const db = require('../db/system');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');

// Generate PDF report
router.get('/download/pdf', (req, res) => {
    const { month } = req.query;
    const formattedMonth = dayjs(`${month}-01`).format('MMMM YYYY'); 

    try {
        const rows = db.prepare('SELECT * FROM jadwal WHERE strftime("%Y-%m", tanggal_mulai) = ?').all(month);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the selected month.' });
        }

        const doc = new PDFDocument();
        const fileName = `laporan_kegiatan_${month}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // Add the rest of the PDF generation logic here...

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate CSV report
router.get('/download/csv', (req, res) => {
    const { month } = req.query;

    try {
        const rows = db.prepare('SELECT * FROM jadwal WHERE strftime("%Y-%m", tanggal_mulai) = ?').all(month);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the selected month.' });
        }

        const fileName = `laporan_kegiatan_${month}.csv`;
        const csvWriter = createCsvWriter({
            path: fileName,
            header: [
                { id: 'nama_kegiatan', title: 'Nama Kegiatan' },
                { id: 'tanggal_mulai', title: 'Tanggal Mulai' },
                { id: 'tanggal_selesai', title: 'Tanggal Selesai' },
                { id: 'jam_mulai', title: 'Jam Mulai' },
                { id: 'jam_selesai', title: 'Jam Selesai' },
            ]
        });

        csvWriter.writeRecords(rows)
            .then(() => {
                res.download(fileName, (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    }
                });
            })
            .catch((error) => {
                res.status(500).json({ error: 'Failed to generate CSV file.' });
            });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
