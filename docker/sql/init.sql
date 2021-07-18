create table users
(
    id        serial                not null
        constraint users_pk
            primary key,
    firstname varchar(30)           not null,
    lastname  varchar(30)           not null,
    password  varchar(100)          not null,
    email     varchar(128)          not null,
    activated boolean default false not null
);

create unique index users_email_uindex
    on users (email);

create table messages
(
    id           serial                  not null
        constraint message_pk
            primary key,
    content      varchar   default 400,
    user_from    integer                 not null
        constraint messages_users_id_fk
            references users,
    conversation integer                 not null
        constraint messages_users_id_fk_2
            references users,
    date         timestamp default now() not null
);

create table users_likes
(
    "userId_0" integer
        constraint users_likes_users_id_fk
            references users,
    "userId_1" integer
        constraint users_likes_users_id_fk_2
            references users
);

create table conversations
(
    id     serial               not null
        constraint conversations_pk
            primary key,
    user_0 integer,
    user_1 integer,
    open   boolean default true not null
);

