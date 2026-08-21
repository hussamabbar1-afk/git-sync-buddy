import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, LifeBuoy, Loader2, MessageSquare, PhoneCall, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard – HandwerkAI" },
      {
        name: "description",
        content:
          "Übersicht über Gespräche, Leads und die Auslastung Ihres KI-Mitarbeiters im SHK-Betrieb.",
      },
      { property: "og:title", content: "Dashboard – HandwerkAI" },
      {
        property: "og:description",
        content: "Kennzahlen zu Gesprächen, Leads und Terminanfragen auf einen Blick.",
      },
    ],
  }),
  component: DashboardPage,
});

type LeadRow = {
  id: string;
  name: string | null;
  issue_type: string | null;
  issue_description: string | null;
  postal_code: string | null;
  address: string | null;
  status: string;
  created_at: string;
};

type CompanyRow = {
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

type DashboardData = {
  company: CompanyRow | null;
  conversationDates: string[];
  leads: LeadRow[];
  hasActiveAgent: boolean;
  hasActiveService: boolean;
  hasServiceArea: boolean;
  hasOpeningHours: boolean;
  openHandoffs: number;
};

const BERLIN_TZ = "Europe/Berlin";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: BERLIN_TZ,
});

function berlinDayKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

function formatDate(value: string) {
  const key = berlinDayKey(value);
  return key || "—";
}

function cleanedName(name: string | null) {
  const value = (name ?? "").trim();
  if (!value || value.toUpperCase() === "EMPTY") return "Unbekannter Kunde";
  return value;
}

function statusLabel(status: string) {
  switch ((status ?? "").toLowerCase()) {
    case "new":
      return "Neu";
    case "qualified":
      return "Qualifiziert";
    default:
      return status || "—";
  }
}

function place(lead: LeadRow) {
  const parts = [lead.postal_code?.trim(), lead.address?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function topic(lead: LeadRow) {
  const parts = [lead.issue_type?.trim(), lead.issue_description?.trim()].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Kein Anliegen hinterlegt";
}

function deltaLabel(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "Neu" : "—";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change >= 0 ? "+" : ""}${change} % zur Vorwoche`;
}

function nonEmpty(value: string | null | undefined) {
  return Boolean((value ?? "").trim());
}

function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Die Daten konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      if (!profile?.company_id) {
        setError("Bitte schließen Sie zuerst die Einrichtung Ihres Unternehmens ab.");
        setLoading(false);
        return;
      }

      const companyId = profile.company_id;
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const [
        companyRes,
        conversationsRes,
        leadsWindowRes,
        recentLeadsRes,
        agentsRes,
        servicesRes,
        areasRes,
        hoursRes,
        handoffRes,
      ] = await Promise.all([
        supabase
          .from("companies")
          .select("name, phone, email, address")
          .eq("id", companyId)
          .maybeSingle(),
        supabase
          .from("conversations")
          .select("created_at")
          .eq("company_id", companyId)
          .gte("created_at", since),
        supabase
          .from("leads")
          .select(
            "id, name, issue_type, issue_description, postal_code, address, status, created_at",
          )
          .eq("company_id", companyId)
          .gte("created_at", since),
        supabase
          .from("leads")
          .select(
            "id, name, issue_type, issue_description, postal_code, address, status, created_at",
          )
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("ai_agents")
          .select("id")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .limit(1),
        supabase
          .from("services")
          .select("id")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .limit(1),
        supabase
          .from("service_areas")
          .select("id, postal_codes")
          .eq("company_id", companyId)
          .eq("is_active", true),
        supabase.from("opening_hours").select("id").eq("company_id", companyId).limit(1),
        supabase
          .from("conversations")
          .select("id")
          .eq("company_id", companyId)
          .eq("status", "needs_human"),
      ]);

      if (cancelled) return;

      const failed =
        companyRes.error ||
        conversationsRes.error ||
        leadsWindowRes.error ||
        recentLeadsRes.error ||
        agentsRes.error ||
        servicesRes.error ||
        areasRes.error ||
        hoursRes.error ||
        handoffRes.error;

      if (failed) {
        setError("Die Daten konnten nicht geladen werden.");
        setLoading(false);
        return;
      }

      setData({
        company: companyRes.data ?? null,
        conversationDates: (conversationsRes.data ?? []).map((row) => row.created_at),
        leads: [...((leadsWindowRes.data ?? []) as LeadRow[])],
        hasActiveAgent: (agentsRes.data ?? []).length > 0,
        hasActiveService: (servicesRes.data ?? []).length > 0,
        hasServiceArea: (areasRes.data ?? []).some((area) => nonEmpty(area.postal_codes)),
        hasOpeningHours: (hoursRes.data ?? []).length > 0,
        openHandoffs: (handoffRes.data ?? []).length,
      });
      setRecentLeads((recentLeadsRes.data ?? []) as LeadRow[]);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const currentFrom = now - week;
    const previousFrom = now - 2 * week;

    const inWindow = (value: string, from: number, to: number) => {
      const time = new Date(value).getTime();
      return !Number.isNaN(time) && time >= from && time < to;
    };

    const conversations = data?.conversationDates ?? [];
    const leads = data?.leads ?? [];

    const convCurrent = conversations.filter((d) => inWindow(d, currentFrom, now)).length;
    const convPrevious = conversations.filter((d) => inWindow(d, previousFrom, currentFrom)).length;

    const leadsCurrent = leads.filter((l) => inWindow(l.created_at, currentFrom, now));
    const leadsPrevious = leads.filter((l) => inWindow(l.created_at, previousFrom, currentFrom));

    const qualifiedCurrent = leadsCurrent.filter(
      (l) => (l.status ?? "").toLowerCase() === "qualified",
    ).length;
    const qualifiedPrevious = leadsPrevious.filter(
      (l) => (l.status ?? "").toLowerCase() === "qualified",
    ).length;

    const rateCurrent = convCurrent > 0 ? Math.round((leadsCurrent.length / convCurrent) * 100) : 0;
    const ratePrevious =
      convPrevious > 0 ? Math.round((leadsPrevious.length / convPrevious) * 100) : 0;

    const todayKey = berlinDayKey(new Date());
    const conversationsToday = conversations.filter((d) => berlinDayKey(d) === todayKey).length;

    return {
      conversationsToday,
      cards: [
        {
          label: "Gespräche (7 Tage)",
          value: String(convCurrent),
          delta: deltaLabel(convCurrent, convPrevious),
          icon: MessageSquare,
        },
        {
          label: "Neue Leads (7 Tage)",
          value: String(leadsCurrent.length),
          delta: deltaLabel(leadsCurrent.length, leadsPrevious.length),
          icon: Users,
        },
        {
          label: "Qualifizierte Leads",
          value: String(qualifiedCurrent),
          delta: deltaLabel(qualifiedCurrent, qualifiedPrevious),
          icon: PhoneCall,
        },
        {
          label: "Offene Übergaben",
          value: String(data?.openHandoffs ?? 0),
          delta: (data?.openHandoffs ?? 0) > 0 ? "Mitarbeiter benötigt" : "Keine offenen Übergaben",
          icon: LifeBuoy,
        },
        {
          label: "Lead-Quote",
          value: `${rateCurrent} %`,
          delta: deltaLabel(rateCurrent, ratePrevious),
          icon: ArrowUpRight,
        },
      ],
    };
  }, [data]);

  const setup = useMemo(() => {
    const company = data?.company;
    const checks = [
      {
        label: "Unternehmensprofil vollständig",
        done:
          nonEmpty(company?.name) &&
          nonEmpty(company?.phone) &&
          nonEmpty(company?.email) &&
          nonEmpty(company?.address),
      },
      { label: "KI-Mitarbeiter aktiv", done: Boolean(data?.hasActiveAgent) },
      { label: "Leistungen hinterlegt", done: Boolean(data?.hasActiveService) },
      { label: "Servicegebiete definiert", done: Boolean(data?.hasServiceArea) },
      { label: "Öffnungszeiten gepflegt", done: Boolean(data?.hasOpeningHours) },
    ];
    const progress = checks.filter((check) => check.done).length * 20;
    return { checks, progress };
  }, [data]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Daten werden geladen …
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <PageHeader title="Übersicht" description="Ihre Kennzahlen auf einen Blick." />
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" asChild>
              <Link to="/einrichtung">Zur Einrichtung</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`Übersicht für ${data?.company?.name?.trim() || "Ihr Unternehmen"}`}
        description={`Heute sind ${metrics.conversationsToday} neue Gespräche eingegangen.`}
        action={
          <Button asChild>
            <Link to="/konversationen">Zu den Gesprächen</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.cards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Neueste Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/leads">Alle Leads</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {recentLeads.length === 0 ? (
              <div className="space-y-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Noch keine Leads vorhanden. Sobald Ihr KI-Mitarbeiter Anfragen bearbeitet,
                  erscheinen sie hier.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/leads">Zu den Leads</Link>
                </Button>
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{cleanedName(lead.name)}</p>
                    <p className="truncate text-xs text-muted-foreground">{topic(lead)}</p>
                    <p className="text-xs text-muted-foreground">
                      {place(lead)} · {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                    {statusLabel(lead.status)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einrichtung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Fortschritt</span>
                <span className="font-medium">{setup.progress} %</span>
              </div>
              <Progress value={setup.progress} className="mt-2" />
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {setup.checks.map((check) => (
                <li key={check.label}>
                  {check.done ? "✓" : "○"} {check.label}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/einrichtung">
                {setup.progress === 100 ? "Einrichtung bearbeiten" : "Einrichtung fortsetzen"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
