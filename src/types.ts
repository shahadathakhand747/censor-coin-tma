export interface CensorCoinUserState {
  membership_verified: boolean;
  reg_status: 'unregistered' | 'registered';
  referral_code: string;
  username: string;
  first_name: string;
  profile_photo_url: string | null;
  total_points: number;
  total_refers: number;
  today_tasks_completed: number;
  claim_codes_used: string[];
  youtube_task_completed: boolean;
  tiktok_task_completed: boolean;
  last_referral_check_date: string;
  ton_address: string;
  last_ton_address_change: string;
  language: 'en' | 'bn' | 'hi' | 'es';
  schema_version: 1;
}

export const DEFAULT_USER_STATE: CensorCoinUserState = {
  membership_verified: false,
  reg_status: 'unregistered',
  referral_code: '',
  username: '',
  first_name: '',
  profile_photo_url: null,
  total_points: 0,
  total_refers: 0,
  today_tasks_completed: 0,
  claim_codes_used: [],
  youtube_task_completed: false,
  tiktok_task_completed: false,
  last_referral_check_date: '',
  ton_address: '',
  last_ton_address_change: '',
  language: 'en',
  schema_version: 1,
};
