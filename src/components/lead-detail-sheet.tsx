import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

type LeadDetail = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  postal_code: string | null;
  address: string | null;
  issue_type: string | null;
  issue_description: string | null;
  urgency: string | null;
  preferred_contact_method: string | null;
  preferred_appointment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  conversation_id: string | null;
};

type MessageRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

function value(input: string | null | undefined) {
  const text = (input ?? "").trim();
  if (!text || text.toUpperCase() === "EMPTY") return "—";
  return text;
}

export function urgencyLabelDetail(urgency: string | null) {
  switch ((urgency ?? "").toLowerCase()) {
    case "emergency":
      return "Notfall";
    case "high":
    case "urgent":
      return "Dringend";
    case "normal":
      return "Normal";
    case "low":
      return "Niedrig";
    default:
      return value(urgency);
  }
}

export function statusLabelDetail(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "new":
      return "Neu";
    case "qualified":
      return "Qualifiziert";
    default:
      return value(status);
  }
}

function formatDateTime(input: string | null) {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())} Uhr`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

export function LeadDetailSheet({
  leadId,
  companyId,
  open,
  onOpenChange,
}: {
  leadId: string | null;
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !leadId || !companyId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setMessagesError(null);
      setLead(null);
      setMessages([]);

      const { data, error: leadError } = await supabase
        .from("leads")
        .select(
          "id, name, phone, email, postal_code, address, issue_type, issue_description, urgency, preferred_contact_method, preferred_appointment, status, created_at, updated_at, conversation_id",
        )
        .eq("id", leadId!)
        .eq("company_id", companyId!)
        .maybeSingle();

      if (cancelled) return;

      if (leadError) {
        setError("Der Lead konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Dieser Lead wurde nicht gefunden.");
        setLoading(false);
        return;
      }

      setLead(data as LeadDetail);
      setLoading(false);

      if (data.conversation_id) {
        const { data: conversation, error: conversationError } = await supabase
          .from("conversations")
          .select("id")
          .eq("id", data.conversation_id)
          .eq("company_id", companyId!)
          .maybeSingle();

        if (cancelled) return;

        if (conversationError || !conversation) {
          if (conversationError) setMessagesError("Der Gesprächsverlauf konnte nicht geladen werden.");
          return;
        }

        const { data: messageRows, error: messagesLoadError } = await supabase
          .from("messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (messagesLoadError) {
          setMessagesError("Der Gesprächsverlauf konnte nicht geladen werden.");
        } else {
          setMessages((messageRows ?? []) as MessageRow[]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, leadId, companyId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Lead-Details</SheetTitle>
          <SheetDescription>
            Alle Angaben zu dieser Anfrage inklusive Gesprächsverlauf.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Lead wird geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : lead ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kunde">{value(lead.name)}</Field>
                <Field label="Telefon">{value(lead.phone)}</Field>
                <Field label="E-Mail">{value(lead.email)}</Field>
                <Field label="PLZ">{value(lead.postal_code)}</Field>
                <Field label="Adresse">{value(lead.address)}</Field>
                <Field label="Anliegen">{value(lead.issue_type)}</Field>
                <Field label="Dringlichkeit">
                  <Badge
                    variant={
                      ["Notfall", "Dringend"].includes(urgencyLabelDetail(lead.urgency))
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {urgencyLabelDetail(lead.urgency)}
                  </Badge>
                </Field>
                <Field label="Status">
                  <Badge variant={lead.status === "new" ? "default" : "outline"}>
                    {statusLabelDetail(lead.status)}
                  </Badge>
                </Field>
                <Field label="Bevorzugter Kontaktweg">
                  {value(lead.preferred_contact_method)}
                </Field>
                <Field label="Wunschtermin">{value(lead.preferred_appointment)}</Field>
                <Field label="Eingang">{formatDateTime(lead.created_at)}</Field>
                <Field label="Zuletzt aktualisiert">{formatDateTime(lead.updated_at)}</Field>
              </div>

              <Field label="Beschreibung">
                <span className="whitespace-pre-wrap">{value(lead.issue_description)}</span>
              </Field>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Gesprächsverlauf</h3>
                {messagesError ? (
                  <p className="text-sm text-destructive">{messagesError}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Für diesen Lead liegt kein Gesprächsverlauf vor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">
                            {message.role === "user" ? "Kunde" : "KI-Mitarbeiter"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(message.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
