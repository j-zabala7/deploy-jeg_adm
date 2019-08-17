CREATE SCHEMA jeg_adm;

set search_path = jeg_adm;

create table client(
	client_id serial,
	client_name varchar(50),
	cuil_cuit varchar(50) unique,
	client_dni varchar(50) unique,
	email varchar(50),
	phone varchar(50),
	addr varchar(60),
	constraint pk_client_id primary key(client_id)
);

create table countryside(
	countryside_id serial,
	countryside_name varchar(50) unique,
	location varchar(50),
	countryside_ha double precision,
	--agregar descripcion
	client_id int,
	constraint pk_countryside primary key(countryside_id),
	constraint fk_countryside_client foreign key  (client_id) references client(client_id)
);

create table lot(
	lot_id serial,
	lot_name varchar(50), 
	lot_ha double precision,
	countryside_id int,
	lot_description varchar(100),
	constraint pk_lot primary key(lot_id),
	constraint fk_lot_conuntryside foreign key (countryside_id) references countryside(countryside_id)
);

create table campaign(
	campaign_id serial,
	campaign_name varchar(50),
	campaign_date_start date,
	campaign_date_end date,
	campaign_description text,
	constraint pk_campaign primary key(campaign_id)
);

create table work(
	work_id serial,
	type varchar(50),
	work_state varchar(50),
	work_description varchar(200),
	start_date date,
	end_date date,
	pricexha double precision,
	lot_id int,
	work_ha double precision,
	campaign_id int,
	countryside_id int,
	client_id int,
	cereal varchar(50),
	currency varchar(50),
	constraint pk_work primary key(work_id),
	constraint fk_work_lot foreign key (lot_id) references lot(lot_id),
	constraint fk_work_campaign foreign key (campaign_id) references campaign(campaign_id),
	constraint fk_work_countryside foreign key (countryside_id) references countryside(countryside_id),
	constraint fk_work_client foreign key (client_id) references client(client_id)
);

create table employee(
	employee_id serial,
	employee_dni varchar(50) unique,
	employee_name varchar(50),
	employee_cuil varchar(50),
	employee_email varchar(50),
	employee_addr varchar(50),
	employee_phone varchar(50),
	employee_birthday date,
	constraint pk_employee primary key(employee_id)
);

create table at_work(
	at_work_id serial,
	employee_id int,
	work_id int,
	has double precision,
	at_work_pricexha double precision,
	total double precision,
	at_work_description varchar(200),
	campaign_id int,
	constraint pk_at_work primary key(at_work_id),
	constraint fk_at_work_employee foreign key (employee_id) references employee(employee_id),
	constraint fk_at_work_work foreign key (work_id) references work(work_id),
	constraint fk_at_work_campaign foreign key (campaign_id) references campaign(campaign_id)
);

create table expenses(
	expenses_id serial,
	made_to varchar(50),
	expenses_amount double precision,
	expenses_description varchar(200),
	expenses_state varchar(50),
	expenses_date date,
	--ver si falta una fecha de vencimiento
	campaign_id int,
	work_id int,
	constraint pk_expenses primary key(expenses_id),
	constraint fk_expenses_campaign foreign key (campaign_id) references campaign(campaign_id),
	constraint fk_expenses_work foreign key (work_id) references work(work_id)
);

create table withdrawal(
	withdrawal_id serial,
	employee_id int,
	withdrawal_amount double precision, --ver si falta la currency
	withdrawal_date date,
	withdrawal_type varchar(50),
	delivered varchar(50),
	campaign_id int,
	work_id int,
	withdrawal_description varchar(200),
	--signature varchar(20),
	constraint pk_withdrawal primary key(withdrawal_id),
	constraint fk_withdrawal_employee foreign key (employee_id) references employee(employee_id),
	constraint fk_withdrawal_campaign foreign key (campaign_id) references campaign(campaign_id),
	constraint fk_withdrawal_work foreign key (work_id) references work(work_id)
		--ver campaing id y work id
);

CREATE TABLE "session" ( --tabla para sesiones ... sacada de node_modules/connect-pg-simple/table.sql 
  "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

create table jeg_adm.user(
	user_id serial,
	username varchar(50),
	password varchar(100),
	fullname varchar(100),
	constraint pk_user primary key(user_id)
);