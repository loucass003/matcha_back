create table users
(
    id        serial       not null,
    firstname varchar(30)  not null,
    lastname  varchar(30)  not null,
    password  varchar(50)  not null,
    email     varchar(128) not null
        constraint users_pk
            primary key
);

create unique index users_username_uindex
    on users (username);
