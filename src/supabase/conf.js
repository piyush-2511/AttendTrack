import {createClient} from '@supabase/supabase-js'
import conf from '../conf/conf'

console.log('Supabase Configuration:', conf.supabaseKey, conf.supabaseUrl)
const supabase = createClient(conf.supabaseUrl,conf.supabaseKey)

export default supabase;