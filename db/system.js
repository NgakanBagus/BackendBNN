const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const bcrypt = require('bcryptjs');

async function insertInitialData() {
    const initialAdmins = [{ username: 'admin1', password: 'admin1234' }];
    const initialUsers = [{ username: 'user1', password: 'user1234' }];

    for (const admin of initialAdmins) {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', admin.username)
            .limit(1) 
            .single(); 

        if (!data && error?.code === 'PGRST116') {
        
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

    for (const user of initialUsers) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', user.username)
            .limit(1) 
            .single(); 

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

insertInitialData();
