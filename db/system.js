const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://okkqbnojvrlckxkqvglk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra3Fibm9qdnJsY2t4a3F2Z2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzcxMjg2MiwiZXhwIjoyMDYzMjg4ODYyfQ.aFClYNB48sdDekmlZ8QCW1mS2IUxQj0NeR9i2R3Ftfk';
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
