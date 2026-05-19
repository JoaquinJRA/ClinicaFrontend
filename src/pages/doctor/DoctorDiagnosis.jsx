import { useState } from "react";
import { ChevronDown, Plus, Search, User } from "lucide-react";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";

const diagnosisHistory = [
  {
    date: "07 Abril 2026",
    summary: "Control preventivo estable",
    diagnosis:
      "Paciente sin signos de enfermedad aguda. Presión arterial y frecuencia dentro de rango.",
    treatment:
      "Mantener hábitos saludables, hidratación y seguimiento preventivo anual.",
    doctor: "Dra. Luz Salazar",
  },
  {
    date: "18 Marzo 2026",
    summary: "Alergia estacional leve",
    diagnosis: "Rinitis alérgica leve con congestión intermitente.",
    treatment: "Loratadina 10mg según síntomas y evitar exposición a polvo.",
    doctor: "Dr. Marco Rivas",
  },
  {
    date: "02 Febrero 2026",
    summary: "Gastritis leve",
    diagnosis: "Molestia gástrica compatible con gastritis leve.",
    treatment: "Dieta blanda, control de irritantes y omeprazol por 7 días.",
    doctor: "Dra. Camila Torres",
  },
];

function DoctorDiagnosis() {
  const [symptoms, setSymptoms] = useState(["Dolor leve", "Fatiga"]);
  const [symptomInput, setSymptomInput] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const addSymptom = () => {
    const nextSymptom = symptomInput.trim();
    if (!nextSymptom) return;
    setSymptoms((currentSymptoms) => [...currentSymptoms, nextSymptom]);
    setSymptomInput("");
  };

  return (
    <div className="mx-auto max-w-280">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A3A6B]">Diagnósticos</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Registre diagnósticos visuales y revise antecedentes del paciente.
        </p>
      </div>

      <Card className="mb-5">
        {/* Búsqueda visual de paciente por identificador. */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input className="pl-12" placeholder="Buscar paciente por ID" />
          </div>
          <Button type="button">Buscar</Button>
        </div>
      </Card>

      <Card className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User className="h-7 w-7 text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Carlos García</h2>
            <p className="mt-1 text-sm text-[#6B7280]">22 años · Hombre</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="severe">Penicilina</Badge>
          <Badge variant="severe">Cítricos</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Nuevo diagnóstico
          </h2>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Motivo de consulta
              </span>
              <Input placeholder="Control general" />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Síntomas
              </span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  onChange={(event) => setSymptomInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSymptom();
                    }
                  }}
                  placeholder="Agregar síntoma"
                  value={symptomInput}
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-5 py-3 font-semibold text-[#1A3A6B] transition hover:bg-blue-50"
                  onClick={addSymptom}
                  type="button"
                >
                  <Plus className="h-5 w-5" />
                  Agregar
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom} variant="blue">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Diagnóstico
              </span>
              <textarea
                className="min-h-28 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                placeholder="Describa el diagnóstico del paciente"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Tratamiento indicado
              </span>
              <textarea
                className="min-h-28 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                placeholder="Indique tratamiento y recomendaciones"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#111827]">
                Observaciones
              </span>
              <textarea
                className="min-h-24 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm text-[#111827] outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                placeholder="Observaciones adicionales"
              />
            </label>
          </div>

          <Button className="mt-6 w-full" type="button">
            Guardar Diagnóstico →
          </Button>
        </Card>

        <section>
          <h2 className="mb-4 text-xl font-bold text-[#1A3A6B]">
            Historial de diagnósticos
          </h2>
          <div className="space-y-4">
            {diagnosisHistory.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <Card className="p-0" key={item.date}>
                  <button
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    type="button"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                        {item.date}
                      </p>
                      <h3 className="mt-1 font-bold text-[#111827]">
                        {item.summary}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#6B7280] transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 text-sm leading-6 text-[#6B7280]">
                      <p>
                        <span className="font-bold text-[#111827]">
                          Diagnóstico:
                        </span>{" "}
                        {item.diagnosis}
                      </p>
                      <p className="mt-2">
                        <span className="font-bold text-[#111827]">
                          Tratamiento:
                        </span>{" "}
                        {item.treatment}
                      </p>
                      <p className="mt-2">
                        <span className="font-bold text-[#111827]">
                          Médico:
                        </span>{" "}
                        {item.doctor}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DoctorDiagnosis;
