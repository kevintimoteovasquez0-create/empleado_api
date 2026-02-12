CREATE TYPE "public"."estado_contrato" AS ENUM('ACTIVO', 'VENCIDO', 'RENOVADO', 'TERMINADO');--> statement-breakpoint
CREATE TYPE "public"."modalidad_contrato" AS ENUM('CONVENIO_PRACTICAS', 'PLAZO_FIJO', 'INDETERMINADO');--> statement-breakpoint
CREATE TYPE "public"."moneda" AS ENUM('PEN', 'USD');--> statement-breakpoint
CREATE TYPE "public"."modalidad" AS ENUM('REMOTO', 'PRESENCIAL', 'SEMIPRESENCIAL');--> statement-breakpoint
CREATE TYPE "public"."tipoEmpleado" AS ENUM('PROF', 'PRAT');--> statement-breakpoint
CREATE TYPE "public"."estado_documento" AS ENUM('PENDIENTE', 'COMPLETO', 'OBSERVADO');--> statement-breakpoint
CREATE TYPE "public"."tipo_archivo" AS ENUM('pdf', 'img');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('dni', 'carnet_extranjeria');--> statement-breakpoint
CREATE TYPE "public"."estado_legajo" AS ENUM('al_dia', 'pendiente', 'observado');--> statement-breakpoint
CREATE TYPE "public"."tipo_personal" AS ENUM('planilla', 'practicante');--> statement-breakpoint
CREATE TYPE "public"."estado_convocatoria" AS ENUM('PENDIENTE', 'ENREVISION', 'PRESELECCIONADO', 'RECHAZADO', 'ACEPTADO');--> statement-breakpoint
CREATE TYPE "public"."estado_licencia" AS ENUM('pendiente', 'aprobado', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."tipo_licencia" AS ENUM('descanso_medico', 'licencia_maternidad', 'licencia_paternidad');--> statement-breakpoint
CREATE TYPE "public"."estado_postulacion" AS ENUM('PENDIENTE', 'REVISADO', 'PRESELECCIONADO', 'NO_APTO', 'APROBADO');--> statement-breakpoint
CREATE TYPE "public"."aplica_para" AS ENUM('PLANILLA', 'PRACTICANTE', 'AMBOS');--> statement-breakpoint
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
CREATE TABLE "area" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "area_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(50) NOT NULL,
	"descripcion" varchar(150) NOT NULL,
	"responsable_id" integer,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contrato" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contrato_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"empleado_id" integer NOT NULL,
	"modalidad" "modalidad_contrato" NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"archivo_pdf" text,
	"sueldo_bruto" numeric(10, 2) NOT NULL,
	"moneda" "moneda" NOT NULL,
	"estado" "estado_contrato" NOT NULL,
	"observaciones" text,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "convocatoria" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "convocatoria_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cargo" varchar(50),
	"usuario_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"tipo_empleado" "tipoEmpleado" NOT NULL,
	"modalidad" "modalidad" NOT NULL,
	"descripcion" text NOT NULL,
	"remuneracion" numeric(10, 2),
	"es_a_convenir" boolean DEFAULT false NOT NULL,
	"responsable_id" integer NOT NULL,
	"fecha_finalizacion" timestamp NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documento_empleado" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documento_empleado_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"empleado_id" integer NOT NULL,
	"requisito_id" integer NOT NULL,
	"archivo_pdf" text NOT NULL,
	"tipo_archivo" "tipo_archivo" NOT NULL,
	"estado" "estado_documento" DEFAULT 'PENDIENTE' NOT NULL,
	"observacion_texto" text,
	"fecha_subida" timestamp DEFAULT now() NOT NULL,
	"revisado_por" integer,
	"fecha_revision" timestamp,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "empleado" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "empleado_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"usuario_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"tipo_documento" "tipo_documento" NOT NULL,
	"numero_documento" varchar(12) NOT NULL,
	"cargo" varchar(100) NOT NULL,
	"tipo_personal" "tipo_personal" NOT NULL,
	"fecha_ingreso" timestamp NOT NULL,
	"fecha_nacimiento" timestamp NOT NULL,
	"telefono" varchar(9) NOT NULL,
	"email_corporativo" varchar(100) NOT NULL,
	"direccion" varchar(255) NOT NULL,
	"distrito" varchar(100) NOT NULL,
	"estado_legajo" "estado_legajo" DEFAULT 'pendiente',
	"auditoria_progreso" integer,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "empleado_numero_documento_unique" UNIQUE("numero_documento"),
	CONSTRAINT "auditoria_progreso_check" CHECK (("empleado"."auditoria_progreso" >= 0) and ("empleado"."auditoria_progreso" <=100))
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
CREATE TABLE "historial_convocatoria" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "historial_convocatoria_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"convocatoria_id" integer NOT NULL,
	"tipo_documento" "tipo_documento_usuario" NOT NULL,
	"numero_documento" varchar(20) NOT NULL,
	"telefono" varchar(9) NOT NULL,
	"nombre" varchar(50) NOT NULL,
	"apellido" varchar(50) NOT NULL,
	"email" varchar(50) NOT NULL,
	"link_cv" varchar(100) NOT NULL,
	"estado_convocatoria" "estado_convocatoria" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "historial_convocatoria_numero_documento_unique" UNIQUE("numero_documento")
);
--> statement-breakpoint
CREATE TABLE "licencia_medica" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "licencia_medica_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"empleado_id" integer NOT NULL,
	"tipo" "tipo_licencia" NOT NULL,
	"diagnostico_cie10" varchar(100) NOT NULL,
	"doctor_tratante" varchar(150) NOT NULL,
	"cmp" varchar(20) NOT NULL,
	"archivo_sustento_pdf" text NOT NULL,
	"fecha_inicio" timestamp NOT NULL,
	"dias_descanso" integer NOT NULL,
	"estado" "estado_licencia" DEFAULT 'pendiente',
	"revisado_por" integer,
	"fecha_revision" timestamp,
	"observaciones" text,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dias_descanso_check" CHECK ("licencia_medica"."dias_descanso" > 0)
);
--> statement-breakpoint
CREATE TABLE "postulacion" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "postulacion_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"convocatoria_id" integer NOT NULL,
	"dni" varchar(20) NOT NULL,
	"nombres" varchar(100) NOT NULL,
	"apellidos" varchar(100) NOT NULL,
	"telefono" varchar(20),
	"whatsapp" varchar(20),
	"email" varchar(100) NOT NULL,
	"experiencia" varchar(50),
	"motivo" text,
	"cv_pdf" text,
	"estado" "estado_postulacion" DEFAULT 'PENDIENTE' NOT NULL,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requisito_documento" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "requisito_documento_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nombre" varchar(100) NOT NULL,
	"descripcion" varchar(255) NOT NULL,
	"es_obligatorio" boolean DEFAULT false NOT NULL,
	"aplica_para" "aplica_para" NOT NULL,
	"orden_visualizacion" integer NOT NULL,
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
	"area_id" integer NOT NULL,
	"nombre" varchar(50) NOT NULL,
	"apellido" varchar(50) NOT NULL,
	"tipo_documento" varchar(20) NOT NULL,
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
	"two_factor_secret" varchar(255),
	"recovery_codes" text,
	"estado_registro" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuario_numero_documento_unique" UNIQUE("numero_documento"),
	CONSTRAINT "usuario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "area" ADD CONSTRAINT "area_responsable_id_usuario_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrato" ADD CONSTRAINT "contrato_empleado_id_empleado_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convocatoria" ADD CONSTRAINT "convocatoria_responsable_id_usuario_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_empleado" ADD CONSTRAINT "documento_empleado_empleado_id_empleado_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_empleado" ADD CONSTRAINT "documento_empleado_requisito_id_requisito_documento_id_fk" FOREIGN KEY ("requisito_id") REFERENCES "public"."requisito_documento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_empleado" ADD CONSTRAINT "documento_empleado_revisado_por_usuario_id_fk" FOREIGN KEY ("revisado_por") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empleado" ADD CONSTRAINT "empleado_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_convocatoria" ADD CONSTRAINT "historial_convocatoria_convocatoria_id_convocatoria_id_fk" FOREIGN KEY ("convocatoria_id") REFERENCES "public"."convocatoria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licencia_medica" ADD CONSTRAINT "licencia_medica_empleado_id_empleado_id_fk" FOREIGN KEY ("empleado_id") REFERENCES "public"."empleado"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licencia_medica" ADD CONSTRAINT "licencia_medica_revisado_por_usuario_id_fk" FOREIGN KEY ("revisado_por") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postulacion" ADD CONSTRAINT "postulacion_convocatoria_id_convocatoria_id_fk" FOREIGN KEY ("convocatoria_id") REFERENCES "public"."convocatoria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_acceso" ADD CONSTRAINT "rol_acceso_rol_id_rol_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_acceso" ADD CONSTRAINT "rol_acceso_acceso_id_acceso_id_fk" FOREIGN KEY ("acceso_id") REFERENCES "public"."acceso"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_rol_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."rol"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresa_id_empresa_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_area_id_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."area"("id") ON DELETE no action ON UPDATE no action;