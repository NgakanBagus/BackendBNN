const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://nbcnhzkctgrnojhhbvqo.supabase.co'; // replace with your actual URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iY25oemtjdGdybm9qaGhidnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjAyMjE1MCwiZXhwIjoyMDQxNTk4MTUwfQ.l17K7F3hOq8dnZGSOFNVHnRc95uZEyMoNS8mH8HOxB8'; // replace with your actual public key
const supabase = createClient(supabaseUrl, supabaseKey);

const bcrypt = require('bcryptjs');

// Insert initial admin and user into Supabase
async function insertInitialData() {
    const initialAdmins = [{ username: 'admin1', password: 'admin1234' }];
    const initialUsers = [{ username: 'user1', password: 'user1234' }];

    // Insert Admins
    for (const admin of initialAdmins) {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', admin.username)
            .limit(1) // Limit to avoid multiple rows
            .single(); // Expect a single row

        if (!data && error?.code === 'PGRST116') {
            // 'PGRST116' is the code for "No rows found"
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            const { error: insertError } = await supabase
                .from('admins')
                .insert([{ username: admin.username, password: hashedPassword }]);

            if (insertError) {
                console.error(`Error inserting admin ${admin.username}:`, insertError.message);
            } else {
                console.log(`Admin ${admin.username} added to the database.`);
            }
        } else if (data) {
            console.log(`Admin ${admin.username} already exists.`);
        } else {
            console.error(`Error querying admin ${admin.username}:`, error.message);
        }
    }

    // Insert Users
    for (const user of initialUsers) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', user.username)
            .limit(1) // Limit to avoid multiple rows
            .single(); // Expect a single row

        if (!data && error?.code === 'PGRST116') {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ username: user.username, password: hashedPassword }]);

            if (insertError) {
                console.error(`Error inserting user ${user.username}:`, insertError.message);
            } else {
                console.log(`User ${user.username} added to the database.`);
            }
        } else if (data) {
            console.log(`User ${user.username} already exists.`);
        } else {
            console.error(`Error querying user ${user.username}:`, error.message);
        }
    }
}

// Call the function to insert data
insertInitialData();
