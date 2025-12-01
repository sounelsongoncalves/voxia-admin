
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    console.log('Checking admin status...');

    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@trucksup.com',
        password: '123456'
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        return;
    }

    console.log('Logged in as:', authData.user.id);

    // 2. Check admins table
    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', authData.user.id);

    if (adminError) {
        console.error('Error checking admins table:', adminError.message);
    } else {
        console.log('Admins table entry:', admin);
    }

    // 3. Check chat threads
    const { data: threads, error: threadsError } = await supabase
        .from('chat_threads')
        .select('*');

    if (threadsError) {
        console.error('Error checking threads:', threadsError.message);
    } else {
        console.log('Chat threads:', threads);
    }
}

checkAdmin();
