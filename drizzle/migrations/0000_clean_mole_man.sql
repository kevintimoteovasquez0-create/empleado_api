CREATE TYPE "public"."tipoEmpleado" AS ENUM('PROF', 'PRAT');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento_usuario" AS ENUM('DNI', 'CE');--> statement-breakpoint
CREATE TABLE "acceso" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "acceso_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(40) NOT NULL,
	"descripcion" varchar(150) NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "areaTrabajo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "areaTrabajo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(50) NOT NULL,
	"descripcion" varchar(150) NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cargoTrabajo" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cargoTrabajo_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(50) NOT NULL,
	"descripcion" varchar(150) NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "convocatoria" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "convocatoria_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cargo_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"tipo_empleado" "tipoEmpleado" NOT NULL,
	"remuneracion" numeric(10, 2) NOT NULL,
	"es_a_convenir" boolean DEFAULT false NOT NULL,
	"responsable_id" integer NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empresa" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "empresa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"razon_social" varchar(50) NOT NULL,
	"ruc" varchar(11) NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rol_acceso" (
	"rol_id" integer NOT NULL,
	"acceso_id" integer NOT NULL,
	CONSTRAINT "rol_acceso_rol_id_acceso_id_pk" PRIMARY KEY("rol_id","acceso_id")
);
--> statement-breakpoint
CREATE TABLE "rol" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rol_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(50) NOT NULL,
	"descripcion" varchar(150) NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usuario_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"rol_id" integer NOT NULL,
	"empresa_id" integer NOT NULL,
	"nombre" varchar(50) NOT NULL,
	"apellido" varchar(50) NOT NULL,
	"tipo_documento" "tipo_documento_usuario" NOT NULL,
	"numero_documento" varchar(20) NOT NULL,
	"fecha_nacimiento" date,
	"fecha_ingreso" date,
	"direccion" varchar(255),
	"pais" varchar(100),
	"departamento" varchar(100),
	"provincia" varchar(100),
	"distrito" varchar(100),
	"telefono" varchar(9),
	"email" varchar(100) NOT NULL,
	"password" varchar(60) NOT NULL,
	"nombre_imagen" varchar,
	"verificado_email" boolean DEFAULT false NOT NULL,
	"remember_token" varchar,
	"token_verificacion_email" varchar(255),
	"token_expiry_email" timestamp,
	"token_verificacion_password" varchar(255),
	"token_expiry_password" timestamp,
	"auth_two_factor" boolean DEFAULT false NOT NULL,
	"two_factor_code" integer,
	"two_factor_expired" timestamp,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_numero_documento_unique" UNIQUE("numero_documento"),
	CONSTRAINT "usuario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_cargo_id_cargoTrabajo_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargoTrabajo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_area_id_areaTrabajo_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areaTrabajo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_responsable_id_usuario_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_acceso" ADD CONSTRAINT "rol_acceso_rol_id_rol_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_acceso" ADD CONSTRAINT "rol_acceso_acceso_id_acceso_id_fk" FOREIGN KEY ("acceso_id") REFERENCES "public"."acceso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_rol_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;