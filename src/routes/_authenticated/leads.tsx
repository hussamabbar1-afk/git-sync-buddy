import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { LeadDetailSheet } from "@/components/lead-detail-sheet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads – HandwerkAI" },
      {
        name: "description",
        content: "Qualifizierte Kundenanfragen mit Anliegen, Dringlichkeit und Status verwalten.",
      },
      { property: "og:title", content: "Leads – HandwerkAI" },
      {
        property: "og:description",
        content: "Alle Anfragen Ihres KI-Mitarbeiters als strukturierte Leads.",
      },
    ],
  }),
  component: LeadsPage,
});

type LeadRow = {
  id: string;
  name: string | null;
  issue_type: string | null;
  issue_description: string | null;
  postal_code: string | null;
  address: string | null;
  urgency: string | null;
  status: string;
  created_at: string;
};

function customerName(name: string | null) {
  const value = (name ?? "").trim();
  if (!value || value.toUpperCase() === "EMPTY") return "Unbekannter Kunde";
  return value;
}

function place(lead: LeadRow) {
  const parts = [lead.postal_code?.trim(), lead.address?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function urgencyLabel(urgency: string | null) {
  switch ((urgency ?? "").toLowerCase()) {
    case "urgent":
    case "high":
      return "Dringend";
    case "low":
      return "Niedrig";
    case "normal":
      return "Normal";
    default:
      return urgency?.trim() ? urgency : "Normal";
  }
}

function statusLabel(status: string) {
  switch ((status ?? "").toLowerCase()) {
    case "new":
      return "Neu";
    case "qualified":
      return "Qualifiziert";
    default:
      return status;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);


  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        if (!cancelled) {
          setError("Sie sind nicht angemeldet.");
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        setError("Die Leads konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setError("Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.");
        setLoading(false);
        return;
      }

      setCompanyId(profile.company_id);

      const { data, error: leadsError } = await supabase
        .from("leads")
        .select(
          "id, name, issue_type, issue_description, postal_code, address, urgency, status, created_at",
        )

        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (leadsError) {
        setError("Die Leads konnten nicht geladen werden.");
      } else {
        setLeads((data ?? []) as LeadRow[]);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recentCount = useMemo(() => {
    const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leads.filter((lead) => new Date(lead.created_at).getTime() >= threshold).length;
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "alle" && (lead.status ?? "").toLowerCase() !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return [
        customerName(lead.name),
        lead.issue_type ?? "",
        lead.issue_description ?? "",
        lead.postal_code ?? "",
        lead.address ?? "",
        statusLabel(lead.status),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [leads, search, statusFilter]);

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        description={`${recentCount} neue Anfragen in den letzten 7 Tagen.`}
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Alle Leads</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Suchen"
              className="sm:w-56"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="new">Neu</SelectItem>
                <SelectItem value="qualified">Qualifiziert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Leads werden geladen …
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Anliegen</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Dringlichkeit</TableHead>
                  <TableHead>Eingang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Keine Leads gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setDetailOpen(true);
                      }}
                    >

                      <TableCell className="font-medium">{customerName(lead.name)}</TableCell>
                      <TableCell>
                        <span>{lead.issue_type?.trim() || "—"}</span>
                        {lead.issue_description?.trim() ? (
                          <span className="block max-w-xs truncate text-xs text-muted-foreground">
                            {lead.issue_description}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{place(lead)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            urgencyLabel(lead.urgency) === "Dringend" ? "destructive" : "secondary"
                          }
                        >
                          {urgencyLabel(lead.urgency)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.status === "new" ? "default" : "outline"}>
                          {statusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadDetailSheet
        leadId={selectedLeadId}
        companyId={companyId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </AppShell>
  );

}
