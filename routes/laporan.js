const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://nbcnhzkctgrnojhhbvqo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY25oemtjdGdybm9qaGhidnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjAyMjE1MCwiZXhwIjoyMDQxNTk4MTUwfQ.l17K7F3hOq8dnZGSOFNVHnRc95uZEyMoNS8mH8HOxB8'; // Replace with your actual key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getJadwalByMonth(month) {
    try {
        // Calculate the last day of the given month dynamically
        const startDate = `${month}-01`;
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD'); // This will get the last day of the month

        const { data, error } = await supabase
            .from('jadwal') // Assuming the table in Supabase is named 'jadwal'
            .select('*')
            .gte('tanggal_mulai', startDate)
            .lte('tanggal_selesai', endDate); // Use dynamic last day of the month

        if (error) {
            throw new Error(`Supabase query error: ${error.message}`);
        }
        return data;
    } catch (error) {
        throw new Error(`Failed to retrieve data: ${error.message}`);
    }
}

router.get('/download/pdf', async (req, res) => {
    const { month } = req.query;
    const formattedMonth = dayjs(`${month}-01`).format('MMMM YYYY');

    try {
        const rows = await getJadwalByMonth(month);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the selected month.' });
        }

        const doc = new PDFDocument();
        const fileName = `laporan_kegiatan_${month}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // Error handling for image loading
        try {
            doc.image('./logo_url.png', 50, 45, { width: 50 });
        } catch (err) {
            console.warn("Logo image not found, skipping image insertion.");
        }

        doc.fontSize(14)
            .text('BIDANG REHABILITASI BNNP BALI (REHAB)', 110, 57);

        doc.moveTo(50, 100).lineTo(550, 100).stroke();
        doc.moveDown(2);  

        doc.fontSize(16).text(`Laporan Kegiatan Bulan ${formattedMonth}`, { align: 'center' });
        doc.moveDown(1);
        doc.fontSize(12).text(`Dicetak pada : ${dayjs().format('ddd, DD/MM/YYYY')}`, { align: 'right' });
        doc.moveDown(4);

         // Lebar dan posisi kolom yang diatur lebih detail
          // Lebar dan posisi kolom yang diatur lebih detail
        const tableHeaderY = 180;

        doc.moveTo(50, tableHeaderY - 10).lineTo(580, tableHeaderY - 10).stroke(); // Adjusted right border for header

        // Header content
        doc.fontSize(10).text('NO', 60, tableHeaderY, { continued: true })
            .text('Kegiatan', 120, tableHeaderY, { continued: true })
            .text('Jam', 300, tableHeaderY, { continued: true })
            .text('Tanggal Mulai & Selesai', 400, tableHeaderY); // Adjust column positioning
        
        // Vertical borders for header
        doc.moveTo(50, tableHeaderY - 10).lineTo(50, tableHeaderY + 10).stroke();   // Left border
        doc.moveTo(120, tableHeaderY - 10).lineTo(120, tableHeaderY + 10).stroke(); // After NO
        doc.moveTo(300, tableHeaderY - 10).lineTo(300, tableHeaderY + 10).stroke(); // After Kegiatan
        doc.moveTo(400, tableHeaderY - 10).lineTo(400, tableHeaderY + 10).stroke(); // After Jam
        doc.moveTo(580, tableHeaderY - 10).lineTo(580, tableHeaderY + 20).stroke(); // Right border

        // Header border bottom
        doc.moveTo(50, tableHeaderY + 10).lineTo(580, tableHeaderY + 10).stroke(); // Extended horizontal line

        // Loop untuk menampilkan isi tabel dan membuat garis vertikal
        rows.forEach((row, index) => {
            const startY = tableHeaderY + 20 + (index * 20);  // Keep consistent row height
        
            // Set column widths for each section
            const kegiatanColWidth = 160;   
            const jamColWidth = 87;   
            const tanggalColWidth = 180;    
        
            // Add text for each cell, with width and word-wrap
            doc.text(`${index + 1}`, 65, startY, { width: 30, align: 'center' })  // NO column
                .text(row.nama_kegiatan, 130, startY, {
                    width: kegiatanColWidth,   // Set column width for text wrapping
                    align: 'left',
                    ellipsis: true   // Add ellipsis if text overflows
                })
                .text(`${row.jam_mulai} - ${row.jam_selesai}`, 310, startY, {
                    width: jamColWidth,
                    align: 'center',  // Ensure time values are centered
                    lineBreak: false  // Prevent automatic line breaks
                })
                .text(`${row.tanggal_mulai} - ${row.tanggal_selesai}`, 410, startY, {
                    width: tanggalColWidth,
                    align: 'center',
                    lineBreak: false   // Ensure the date stays on the same line
                });
        
            // Draw vertical borders for the table
            doc.moveTo(50, startY - 10).lineTo(50, startY + 10).stroke();   // Left border
            doc.moveTo(120, startY - 10).lineTo(120, startY + 10).stroke(); // Border after NO
            doc.moveTo(300, startY - 10).lineTo(300, startY + 10).stroke(); // Border after Kegiatan
            doc.moveTo(400, startY - 10).lineTo(400, startY + 10).stroke(); // Border after Jam
            doc.moveTo(580, startY - 10).lineTo(580, startY + 10).stroke(); // Right border
        
            // Draw horizontal line under each row
            doc.moveTo(50, startY + 10).lineTo(580, startY + 10).stroke(); // Horizontal line for each row
        });

        doc.end();
        
    } catch (error) {
        console.error('Error generating PDF:', error.message);
        res.status(500).json({ error: 'Failed to generate PDF.' });
    }
});

router.get('/download/csv', async (req, res) => {
    const { month } = req.query;

    try {
        // Fetch data from Supabase
        const rows = await getJadwalByMonth(month);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the selected month.' });
        }

        const csvFilePath = path.join(__dirname, `laporan_kegiatan_${month}.csv`);
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'nama_kegiatan', title: 'Nama Kegiatan' },
                { id: 'tanggal_mulai', title: 'Tanggal Mulai' },
                { id: 'tanggal_selesai', title: 'Tanggal Selesai' },
                { id: 'jam_mulai', title: 'Jam Mulai' },
                { id: 'jam_selesai', title: 'Jam Selesai' }
            ]
        });

        // Write records to CSV
        await csvWriter.writeRecords(rows);

        // Send the file as a response
        res.setHeader('Content-disposition', `attachment; filename=laporan_kegiatan_${month}.csv`);
        res.setHeader('Content-Type', 'text/csv');
        res.download(csvFilePath, (err) => {
            if (err) {
                console.error('File download error:', err);
            }
            // Delete the file after sending it
            fs.unlinkSync(csvFilePath);
        });

    } catch (error) {
        console.error('CSV generation error:', error.message);
        return res.status(500).json({ error: 'Failed to generate CSV file.' });
    }
});

module.exports = router;
