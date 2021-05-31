create table users
(
    id                serial                not null
        constraint users_pk
            primary key,
    firstname         varchar(30)           not null,
    lastname          varchar(30)           not null,
    password          varchar(100)          not null,
    email             varchar(128)          not null,
    activated         boolean default false not null
);

create unique index users_id_uindex
    on users (id);

