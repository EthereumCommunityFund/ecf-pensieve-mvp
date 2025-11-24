# Database Schema

```dbml
enum admin_whitelist_role {
  super_admin
  admin
  extra
}

table active_logs {
  id uuid [pk, not null, default: `gen_random_uuid()`]
  created_at "timestamp with time zone" [not null, default: `now()`]
  user_id uuid [not null]
  action text [not null]
  type text [not null]
  target_id bigint [not null]
  project_id bigint
  items json
  proposal_creator_id uuid

  indexes {
    user_id [name: 'active_logs_user_id_idx']
    created_at [name: 'active_logs_created_at_idx']
    project_id [name: 'active_logs_project_id_idx']
    (user_id, created_at) [name: 'active_logs_user_created_at_idx']
  }
}

table admin_whitelist {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
  address text [not null, unique]
  nickname text
  role admin_whitelist_role [not null, default: 'admin']
  is_disabled boolean [not null, default: false]
}

table invitation_codes {
  id bigserial [pk, not null, increment]
  code text [not null, unique]
  max_uses integer [not null, default: 3]
  current_uses integer [not null, default: 0]
  created_at "timestamp with time zone" [not null, default: `now()`]
}

table item_proposals {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  key text [not null]
  value jsonb
  ref text
  project_id bigint [not null]
  creator uuid [not null]
  reason text

  indexes {
    project_id [name: 'item_proposals_project_id_idx']
    creator [name: 'item_proposals_creator_idx']
    key [name: 'item_proposals_key_idx']
    (project_id, key) [name: 'item_proposals_project_id_key_idx']
  }
}

table like_records {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  project_id bigint
  creator uuid [not null]
  weight "double precision"

  indexes {
    project_id [name: 'like_records_project_id_idx']
    creator [name: 'like_records_creator_idx']
    (project_id, creator) [name: 'like_records_project_id_creator_idx']
  }
}

table list_follows {
  id bigserial [pk, not null, increment]
  list_id bigint [not null]
  user_id uuid [not null]
  created_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    (list_id, user_id) [name: 'list_follows_list_id_user_id_unique', unique]
    list_id [name: 'list_follows_list_id_idx']
    user_id [name: 'list_follows_user_id_idx']
  }
}

table list_projects {
  id bigserial [pk, not null, increment]
  list_id bigint [not null]
  project_id bigint [not null]
  added_by uuid [not null]
  sort_order integer [not null, default: 0]
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    (list_id, project_id) [name: 'list_projects_list_id_project_id_unique', unique]
    list_id [name: 'list_projects_list_id_idx']
    project_id [name: 'list_projects_project_id_idx']
    (list_id, sort_order) [name: 'list_projects_list_id_sort_order_idx']
  }
}

table lists {
  id bigserial [pk, not null, increment]
  name text [not null]
  description text
  privacy text [not null]
  creator uuid [not null]
  slug text [not null, unique]
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
  follow_count integer [not null, default: 0]

  indexes {
    creator [name: 'lists_creator_idx']
    privacy [name: 'lists_privacy_idx']
    slug [name: 'lists_slug_idx']
    created_at [name: 'lists_created_at_idx']
  }
}

table login_nonces {
  address text [pk, not null]
  nonce text [not null]
  expires_at "timestamp with time zone" [not null]
}

table notification_queue {
  id serial [pk, not null, increment]
  status text [not null, default: 'pending']
  priority integer [not null, default: 0]
  payload jsonb [not null]
  attempts integer [not null, default: 0]
  max_attempts integer [not null, default: 3]
  scheduled_at timestamp
  processing_at timestamp
  completed_at timestamp
  failed_at timestamp
  error text
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]
}

table notifications {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  user_id uuid [not null]
  project_id bigint
  proposal_id bigint
  item_proposal_id bigint
  type text [not null]
  reward "double precision"
  voter_id uuid
  metadata jsonb
  read_at "timestamp with time zone"
  archived_at "timestamp with time zone"
}

table profiles {
  user_id uuid [pk, not null]
  name text [not null]
  avatar_url text
  address text [not null]
  weight "double precision" [default: 0]
  invitation_code_id bigint
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
}

table project_logs {
  id uuid [pk, not null, default: `gen_random_uuid()`]
  created_at "timestamp with time zone" [not null, default: `now()`]
  project_id bigint
  proposal_id bigint
  item_proposal_id bigint
  key text
  is_not_leading boolean [not null, default: false]

  indexes {
    (project_id, key) [name: 'project_logs_project_id_key_idx']
    created_at [name: 'project_logs_created_at_idx']
    project_id [name: 'project_logs_project_id_idx']
    key [name: 'project_logs_key_idx']
    (project_id, key, created_at) [name: 'project_logs_project_id_key_created_at_idx']
  }
}

table project_notification_settings {
  user_id uuid [not null]
  project_id bigint [not null]
  notification_mode text [not null, default: 'all_events']
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    (user_id, project_id) [pk]
  }
}

table project_relations {
  id bigserial [pk, not null, increment]
  source_project_id bigint [not null]
  target_project_id bigint [not null]
  relation_type text [not null]
  item_proposal_id bigint
  project_log_id uuid
  is_active boolean [not null, default: true]
  created_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    (source_project_id, is_active) [name: 'pr_source_active_idx']
    (target_project_id, is_active) [name: 'pr_target_active_idx']
    project_log_id [name: 'pr_project_log_idx']
    (source_project_id, target_project_id, relation_type) [name: 'pr_unique_relation_idx', unique]
  }
}

table projects {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
  name text [not null]
  tagline text [not null]
  categories text[] [not null]
  main_description text [not null]
  logo_url text [not null]
  websites jsonb[] [not null]
  app_url text
  date_founded timestamp [not null]
  date_launch timestamp
  dev_status text [not null]
  funding_status text
  open_source boolean [not null]
  code_repo text
  token_contract text
  org_structure text [not null]
  public_goods boolean [not null]
  founders jsonb[] [not null]
  tags text[] [not null]
  white_paper text
  dapp_smart_contracts jsonb
  creator uuid [not null]
  refs jsonb[]
  is_published boolean [not null, default: false]
  items_top_weight jsonb [not null, default: '{}']
  support "double precision" [not null, default: 0]
  like_count integer [not null, default: 0]
  has_proposal_keys text[] [not null, default: `[]`]
  short_code text [unique]

  indexes {
    creator [name: 'projects_creator_idx']
    is_published [name: 'projects_is_published_idx']
    (is_published, id) [name: 'projects_pagination_idx']
    created_at [name: 'projects_created_at_idx']
    categories [name: 'projects_categories_gin_idx']
  }
}

table project_snaps {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  project_id bigint [not null]
  items jsonb [not null]
  name text
  categories text[]

  indexes {
    project_id [name: 'project_snaps_project_id_idx']
    created_at [name: 'project_snaps_created_at_idx']
    (project_id, created_at) [name: 'project_snaps_project_id_created_at_idx']
    categories [name: 'project_snaps_categories_gin_idx']
  }
}

table proposals {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  items jsonb[] [not null]
  refs jsonb[]
  project_id bigint [not null]
  creator uuid [not null]

  indexes {
    project_id [name: 'proposals_project_id_idx']
    creator [name: 'proposals_creator_idx']
  }
}

table ranks {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
  project_id bigserial [not null, increment]
  published_genesis_weight "double precision" [not null, default: 0]

  indexes {
    project_id [name: 'ranks_project_id_idx']
    published_genesis_weight [name: 'ranks_published_genesis_weight_idx']
    (published_genesis_weight, project_id) [name: 'ranks_ranking_idx']
  }
}

table share_links {
  id bigserial [pk, not null, increment]
  code text [not null, unique]
  entity_type text [not null]
  entity_id text [not null]
  parent_id text
  target_url text [not null]
  visibility text [not null, default: 'public']
  og_snapshot jsonb
  channel_overrides jsonb
  stats jsonb
  created_by uuid
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]
  expires_at "timestamp with time zone"

  indexes {
    entity_type [name: 'share_links_entity_type_idx']
    (entity_type, entity_id) [name: 'share_links_entity_unique_idx', unique]
  }
}

table sieve_follows {
  id bigserial [pk, not null, increment]
  sieve_id bigint [not null]
  user_id uuid [not null]
  created_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    (sieve_id, user_id) [name: 'sieve_follows_sieve_id_user_id_unique', unique]
    sieve_id [name: 'sieve_follows_sieve_id_idx']
    user_id [name: 'sieve_follows_user_id_idx']
  }
}

table sieves {
  id bigserial [pk, not null, increment]
  name text [not null]
  description text
  target_path text [not null]
  visibility text [not null, default: 'public']
  creator uuid [not null]
  share_link_id bigint [not null]
  follow_count integer [not null, default: 0]
  filter_conditions jsonb
  created_at "timestamp with time zone" [not null, default: `now()`]
  updated_at "timestamp with time zone" [not null, default: `now()`]

  indexes {
    creator [name: 'sieves_creator_idx']
    share_link_id [name: 'sieves_share_link_idx', unique]
    created_at [name: 'sieves_created_at_idx']
  }
}

table user_action_logs {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  user_id uuid [not null]
  action text [not null]
  type text [not null]
}

table vote_records {
  id bigserial [pk, not null, increment]
  created_at "timestamp with time zone" [not null, default: `now()`]
  key text [not null]
  proposal_id bigint
  item_proposal_id bigint
  creator uuid [not null]
  weight "double precision"
  project_id bigint [not null]

  indexes {
    proposal_id [name: 'vote_records_proposal_id_idx']
    creator [name: 'vote_records_creator_idx']
    key [name: 'vote_records_key_idx']
    (creator, key) [name: 'vote_records_creator_key_idx']
    (creator, proposal_id, key) [name: 'vote_records_creator_proposal_key_idx']
    (creator, project_id, key) [name: 'vote_records_creator_project_key_null_proposal_idx']
    (item_proposal_id, key) [name: 'vote_records_item_proposal_key_idx']
    (creator, proposal_id, key) [name: 'vote_records_proposal_vote_unique_idx', unique]
    (creator, item_proposal_id, key) [name: 'vote_records_item_proposal_vote_unique_idx', unique]
  }
}

ref: active_logs.user_id > profiles.user_id

ref: active_logs.project_id > projects.id

ref: active_logs.proposal_creator_id > profiles.user_id

ref: item_proposals.creator - profiles.user_id

ref: item_proposals.project_id - projects.id

ref: like_records.creator - profiles.user_id

ref: like_records.project_id - projects.id

ref: list_follows.list_id > lists.id

ref: list_follows.user_id > profiles.user_id

ref: list_projects.list_id > lists.id

ref: list_projects.project_id > projects.id

ref: list_projects.added_by - profiles.user_id

ref: list_projects.project_id - project_snaps.project_id

ref: lists.creator > profiles.user_id

ref: notifications.user_id > profiles.user_id

ref: notifications.project_id > projects.id

ref: notifications.proposal_id > proposals.id

ref: notifications.item_proposal_id - item_proposals.id

ref: notifications.voter_id > profiles.user_id

ref: notifications.project_id - project_snaps.project_id

ref: profiles.invitation_code_id > invitation_codes.id

ref: project_logs.project_id - projects.id

ref: project_logs.proposal_id - proposals.id

ref: project_logs.item_proposal_id - item_proposals.id

ref: project_notification_settings.user_id > profiles.user_id

ref: project_notification_settings.project_id > projects.id

ref: projects.id - project_snaps.project_id

ref: projects.creator > profiles.user_id

ref: ranks.project_id - projects.id

ref: proposals.creator > profiles.user_id

ref: proposals.project_id > projects.id

ref: sieve_follows.sieve_id > sieves.id

ref: sieve_follows.user_id > profiles.user_id

ref: sieves.creator > profiles.user_id

ref: sieves.share_link_id - share_links.id

ref: vote_records.creator > profiles.user_id

ref: vote_records.proposal_id > proposals.id

ref: vote_records.item_proposal_id > item_proposals.id

ref: vote_records.project_id - projects.id
```
