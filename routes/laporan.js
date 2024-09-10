const express = require('express');
const router = express.Router();
const db = require('../db/system');
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');

router.get('/download/pdf', (req, res) => {
    const { month } = req.query;
   
    const formattedMonth = dayjs(`${month}-01`).format('MMMM YYYY'); 

    db.all('SELECT * FROM jadwal WHERE strftime("%Y-%m", tanggal_mulai) = ?', [month], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        if (rows.length === 0) {
            res.status(404).json({ error: 'No data found for the selected month.' });
            return;
        }

        const doc = new PDFDocument();
        const fileName = `laporan_kegiatan_${month}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        doc.image('./logo_url.png', 50, 45, { width: 50 })
            .fontSize(14)
            .text('BIDANG REHABILITASI BNNP BALI (REHAB)', 110, 57);

        doc.moveTo(50, 100) 
            .lineTo(550, 100)
            .stroke();

        doc.moveDown(2);  

        doc.fontSize(16).text(`Laporan Kegiatan Bulan ${formattedMonth}`, { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(12).text(`Dicetak pada : ${dayjs().format('ddd, DD/MM/YYYY')}`, { align: 'right' });

        doc.moveDown(4);  

        const tableHeaderY = 180;  // Mengatur posisi Y untuk header tabel

        doc.moveTo(50, tableHeaderY - 10).lineTo(550, tableHeaderY - 10).stroke();

        // Header content
        doc.fontSize(10).text('NO', 60, tableHeaderY, { continued: true })
            .text('Kegiatan', 120, tableHeaderY, { continued: true })
            .text('Jam', 300, tableHeaderY, { continued: true })
            .text('Tanggal Mulai & Selesai', 380, tableHeaderY);
        
            doc.moveTo(50, tableHeaderY - 10).lineTo(50, tableHeaderY + 10).stroke();   // Left border
            doc.moveTo(120, tableHeaderY - 10).lineTo(120, tableHeaderY + 10).stroke(); // After NO
            doc.moveTo(300, tableHeaderY - 10).lineTo(300, tableHeaderY + 10).stroke(); // After Kegiatan
            doc.moveTo(390, tableHeaderY - 10).lineTo(390, tableHeaderY + 10).stroke(); // After Jam
            doc.moveTo(580, tableHeaderY - 10).lineTo(580, tableHeaderY + 20).stroke(); // Right border
            
        // Header border bottom
        doc.moveTo(50, tableHeaderY + 10).lineTo(550, tableHeaderY + 10).stroke();
        
        // Loop untuk menampilkan isi tabel dan membuat garis vertikal
        rows.forEach((row, index) => {
            const startY = tableHeaderY + 20 + (index * 20);  // Adjust row spacing
        
            // Set column widths
            const kegiatanColWidth = 160;   // Adjusted width for "Kegiatan"
            const jamColWidth = 80;         // Width for "Jam"
            const tanggalColWidth = 180;    // Adjusted width for "Tanggal Mulai & Selesai"
        
            // Add text for each cell, with width and word-wrap
            doc.text(`${index + 1}`, 70, startY, { width: 30, align: 'center' })
                .text(row.nama_kegiatan, 130, startY, {
                    width: kegiatanColWidth,   // Set column width for text wrapping
                    align: 'left',
                    ellipsis: true   // Add ellipsis if text overflows
                })
                .text(`${row.jam_mulai} - ${row.jam_selesai}`, 300, startY, {
                    width: jamColWidth,
                    align: 'center'
                })
                .text(`${row.tanggal_mulai} - ${row.tanggal_selesai}`, 400, startY, {
                    width: tanggalColWidth,
                    align: 'center',
                    lineBreak: true   // Allow text to break lines if too long
                });
        
            // Draw vertical borders for the table
            doc.moveTo(50, startY - 10).lineTo(50, startY + 10).stroke();   // Left border
            doc.moveTo(120, startY - 10).lineTo(120, startY + 10).stroke(); // Border after NO
            doc.moveTo(300, startY - 10).lineTo(300, startY + 10).stroke(); // Border after Kegiatan
            doc.moveTo(390, startY - 10).lineTo(390, startY + 10).stroke(); // Border after Jam
            doc.moveTo(580, startY - 10).lineTo(580, startY + 10).stroke(); // Right border
        
            // Draw horizontal line under each row
            doc.moveTo(50, startY + 10).lineTo(580, startY + 10).stroke();
        });        
        
        doc.end();
        
        });
    });
  
// Rute untuk mengunduh laporan sebagai CSV
router.get('/download/csv', (req, res) => {
    const { month } = req.query;
  
    db.all('SELECT * FROM jadwal WHERE strftime("%Y-%m", tanggal_mulai) = ?', [month], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
  
        if (rows.length === 0) {
            res.status(404).json({ error: 'No data found for the selected month.' });
            return;
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
                        console.error(err.message);
                        res.status(500).json({ error: err.message });
                    }
                });
            })
            .catch((error) => {
                console.error('Error writing CSV:', error);
                res.status(500).json({ error: 'Failed to generate CSV file.' });
            });
    });
  });  

module.exports = router;
