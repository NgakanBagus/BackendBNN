const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getJadwalByMonth(month) {
    try {
        const startDate = `${month}-01`;
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD'); 
        const { data, error } = await supabase
            .from('jadwal') 
            .select('*')
            .gte('tanggal_mulai', startDate)
            .lte('tanggal_selesai', endDate); 

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

        try {
            doc.image(path.join(__dirname, '../public/logo_url.png'), 50, 45, { width: 50 });
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

        const tableHeaderY = 180;

        doc.moveTo(50, tableHeaderY - 10).lineTo(580, tableHeaderY - 10).stroke(); 

        doc.fontSize(10).text('NO', 60, tableHeaderY, { continued: true })
            .text('Kegiatan', 120, tableHeaderY, { continued: true })
            .text('Jam', 300, tableHeaderY, { continued: true })
            .text('Tanggal Mulai & Selesai', 400, tableHeaderY);
        
        doc.moveTo(50, tableHeaderY - 10).lineTo(50, tableHeaderY + 10).stroke();   
        doc.moveTo(120, tableHeaderY - 10).lineTo(120, tableHeaderY + 10).stroke(); 
        doc.moveTo(300, tableHeaderY - 10).lineTo(300, tableHeaderY + 10).stroke(); 
        doc.moveTo(400, tableHeaderY - 10).lineTo(400, tableHeaderY + 10).stroke(); 
        doc.moveTo(580, tableHeaderY - 10).lineTo(580, tableHeaderY + 20).stroke(); 

        doc.moveTo(50, tableHeaderY + 10).lineTo(580, tableHeaderY + 10).stroke(); 

        rows.forEach((row, index) => {
            const startY = tableHeaderY + 20 + (index * 20);  
            const kegiatanColWidth = 160;   
            const jamColWidth = 87;   
            const tanggalColWidth = 180;    
        
            doc.text(`${index + 1}`, 65, startY, { width: 30, align: 'center' })  
                .text(row.nama_kegiatan, 130, startY, {
                    width: kegiatanColWidth,   
                    align: 'left',
                    ellipsis: true   
                })
                .text(`${row.jam_mulai} - ${row.jam_selesai}`, 310, startY, {
                    width: jamColWidth,
                    align: 'center',  
                    lineBreak: false  
                })
                .text(`${row.tanggal_mulai} - ${row.tanggal_selesai}`, 410, startY, {
                    width: tanggalColWidth,
                    align: 'center',
                    lineBreak: false   
                });
        
            doc.moveTo(50, startY - 10).lineTo(50, startY + 10).stroke();   
            doc.moveTo(120, startY - 10).lineTo(120, startY + 10).stroke(); 
            doc.moveTo(300, startY - 10).lineTo(300, startY + 10).stroke(); 
            doc.moveTo(400, startY - 10).lineTo(400, startY + 10).stroke(); 
            doc.moveTo(580, startY - 10).lineTo(580, startY + 10).stroke(); 
        
            doc.moveTo(50, startY + 10).lineTo(580, startY + 10).stroke(); 
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
        const rows = await getJadwalByMonth(month);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No data found for the selected month.' });
        }

        let csvContent = 'Nama Kegiatan,Tanggal Mulai,Tanggal Selesai,Jam Mulai,Jam Selesai\n'; 

        rows.forEach(row => {
            csvContent += `${row.nama_kegiatan},${row.tanggal_mulai},${row.tanggal_selesai},${row.jam_mulai},${row.jam_selesai}\n`;
        });

        const fileName = `laporan_kegiatan_${month}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'text/csv');

        res.send(csvContent);
    } catch (error) {
        console.error('CSV generation error:', error.message);
        return res.status(500).json({ error: 'Failed to generate CSV file.' });
    }
});

module.exports = router;


