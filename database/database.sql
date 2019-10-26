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
	at_work_currency varchar(50),
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
	expenses_currency varchar(50),
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
	deliverer varchar(100),
	campaign_id int,
	work_id int,
	withdrawal_description varchar(200),
	--signature varchar(20),
	withdrawal_currency varchar(50),
	withdrawal_concept varchar(50),
	constraint pk_withdrawal primary key(withdrawal_id),
	constraint fk_withdrawal_employee foreign key (employee_id) references employee(employee_id),
	constraint fk_withdrawal_campaign foreign key (campaign_id) references campaign(campaign_id),
	constraint fk_withdrawal_work foreign key (work_id) references work(work_id)
		--ver campaing id y work id
);

create table jeg_adm.iva (
	iva_id serial,
	iva_value double precision,
	iva_rate double precision,
	iva_description varchar(200),
	constraint pk_iva primary key(iva_id)
);

create table jeg_adm.invoice (
	invoice_id serial,
	client_id int,
	invoice_date date,
	subtotal_amount double precision,
	amount_iva double precision,
	total_amount double precision,
	invoice_description varchar(200),
	invoice_currency varchar(50),
	iva_id int,
	invoice_state varchar(100),
	invoice_type varchar(50),
	invoice_nro int CONSTRAINT invoice_unique_nro UNIQUE,
	constraint pk_invoice primary key(invoice_id),
	constraint fk_invoice_client foreign key (client_id) references jeg_adm.client(client_id),
	constraint fk_invoice_iva foreign key (iva_id) references jeg_adm.iva(iva_id)
);

create table jeg_adm.invoice_line (
	invoice_line_id serial,
	invoice_id int,
	work_id int,
	invoiced_ha double precision,
	total_ha double precision,
	amount_invoice_line double precision,
	invoice_line_description varchar(200),
	invoice_line_currency varchar(50),
	invoice_line_pricexha double precision,
	constraint pk_invoice_line primary key(invoice_line_id),
	constraint fk_invoice_line_invoice foreign key (invoice_id) references jeg_adm.invoice(invoice_id),
	constraint fk_invoice_line_work foreign key (work_id) references jeg_adm.work(work_id)
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


-- triggers to update the invoice total.
/*
create or replace function function_update_invoice() returns trigger as
$$
DECLARE 
id integer;
total double precision;
iva double precision;
BEGIN
select invoice_id, sum(amount_invoice_line) as total into id, total from (select invoice_id,amount_invoice_line from jeg_adm.invoice_line where invoice_id = new.invoice_id ) inv group by invoice_id;
update jeg_adm.invoice set subtotal_amount=total where invoice_id=id;
select iva_rate into iva from ((select invoice_id, iva_id from jeg_adm.invoice where invoice_id=id) inv natural join (select iva_id, iva_rate from jeg_adm.iva) iva);
update jeg_adm.invoice set total_amount=(subtotal_amount*iva) where invoice_id=id;
return new;
END;$$
LANGUAGE 'plpgsql';


create trigger trigger_update_invoice 
after update on jeg_adm.invoice_line 
FOR EACH ROW
EXECUTE PROCEDURE function_update_invoice();

create or replace function function_delete_invoice() returns trigger as
$$
DECLARE 
id integer;
total double precision;
iva double precision;
BEGIN
select invoice_id, sum(amount_invoice_line) as total into id, total from (select invoice_id,amount_invoice_line from jeg_adm.invoice_line where invoice_id = old.invoice_id ) inv group by invoice_id;
update jeg_adm.invoice set subtotal_amount=total where invoice_id=id;
select iva_rate into iva from ((select invoice_id, iva_id from jeg_adm.invoice where invoice_id=id) inv natural join (select iva_id, iva_rate from jeg_adm.iva) iva);
update jeg_adm.invoice set total_amount=(subtotal_amount*iva) where invoice_id=id;
return new;
END;$$
LANGUAGE 'plpgsql';


create  trigger jeg_adm.trigger_delete_invoice
after delete on jeg_adm.invoice_line
for EACH ROW
EXECUTE PROCEDURE function_delete_invoice();

create trigger jeg_adm.trigger_insert_invoice
after insert on jeg_adm.invoice_line
for EACH ROW
EXECUTE PROCEDURE function_update_invoice();
*/


set search_path = jeg_adm;

create or replace function function_update_invoice() returns trigger as
$$
DECLARE 
id integer;
total double precision;
iva double precision;
BEGIN
select invoice_id, sum(amount_invoice_line) as total into id, total from (select invoice_id,amount_invoice_line from jeg_adm.invoice_line where invoice_id = new.invoice_id ) inv group by invoice_id;
update jeg_adm.invoice set subtotal_amount=total where invoice_id=id;
select iva_rate into iva from ((select invoice_id, iva_id from jeg_adm.invoice where invoice_id=id) inv natural join (select iva_id, iva_rate from jeg_adm.iva) iva);
update jeg_adm.invoice set amount_iva=(subtotal_amount*iva) where invoice_id=id;
update jeg_adm.invoice set total_amount=((subtotal_amount*iva) + subtotal_amount) where invoice_id=id;
return new;
END;$$
LANGUAGE 'plpgsql';


create trigger trigger_update_invoice 
after update on jeg_adm.invoice_line 
FOR EACH ROW
EXECUTE PROCEDURE jeg_adm.function_update_invoice();

create or replace function jeg_adm.function_delete_invoice() returns trigger as
$$
DECLARE 
id integer;
total double precision;
iva double precision;
BEGIN
select invoice_id, sum(amount_invoice_line) as total into id, total from (select invoice_id,amount_invoice_line from jeg_adm.invoice_line where invoice_id = old.invoice_id ) inv group by invoice_id;
update jeg_adm.invoice set subtotal_amount=total where invoice_id=id;
select iva_rate into iva from ((select invoice_id, iva_id from jeg_adm.invoice where invoice_id=id) inv natural join (select iva_id, iva_rate from jeg_adm.iva) iva);
update jeg_adm.invoice set amount_iva=(subtotal_amount*iva) where invoice_id=id;
update jeg_adm.invoice set total_amount=((subtotal_amount*iva) + subtotal_amount) where invoice_id=id;
return new;
END;$$
LANGUAGE 'plpgsql';


create  trigger trigger_delete_invoice
after delete on jeg_adm.invoice_line
for EACH ROW
EXECUTE PROCEDURE jeg_adm.function_delete_invoice();

create trigger trigger_insert_invoice
after insert on jeg_adm.invoice_line
for EACH ROW
EXECUTE PROCEDURE jeg_adm.function_update_invoice();

insert into jeg_adm.iva values (default, 10.5, (10.5/100), 'Servicios');
insert into jeg_adm.iva values (default, 21, (21/100), 'Insumos');

insert into jeg_adm.user values (default, 'admin', '$2a$10$aWUr2SR.kdmJ1CtS6qft/uRQPxnyIgtze4MhYTNOCn3rB650aq3oS', 'admin');


create table jeg_adm.payment (
	payment_id serial,
	invoice_id integer,
	campaign_id integer,
	work_id integer,
	payment_total double precision,
	payment_date date,
	payment_method varchar(50),
	id_payment_method varchar(100),
	payment_currency varchar(50),
	payment_description varchar(200),
--	company_id integer,
	constraint pk_payment primary key (payment_id),
	constraint fk_payment_invoice foreign key (invoice_id) references jeg_adm.invoice(invoice_id),
	constraint fk_payment_campaign foreign key (campaign_id) references jeg_adm.campaign(campaign_id),
	constraint fk_payment_work foreign key (work_id) references jeg_adm.work(work_id),
--	constraint fk_payment_company foreign key (company_id) references jeg_adm.company(company_id)
);

create table jeg_adm.company (
	company_id integer,
	company_name varchar(50),
	constraint pk_company primary key (company_id)
);

