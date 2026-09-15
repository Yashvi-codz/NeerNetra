import { jsPDF } from 'jspdf';
import type { Incident } from '@/types';
import { getVesselById } from '@/data/vessels';
import { getCounterfactualForVessel } from '@/data/counterfactual';
import { getCauseAnalysisForIncident } from '@/data/causeAnalysis';
import { getDarkContactsForIncident } from '@/data/darkContacts';
import { computeResponsePriority } from '@/services/responsePriority';
import { getReplayEvents } from '@/data/replay';
import { formatUtcClock, formatUtcDate } from '@/services/time';

const MARGIN = 14;
const PAGE_WIDTH = 210; // A4 mm
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_HEIGHT = 297;

class ReportWriter {
  doc: jsPDF;
  y = MARGIN;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
  }

  private ensureSpace(lineHeight: number) {
    if (this.y + lineHeight > PAGE_HEIGHT - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  title(text: string) {
    this.ensureSpace(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.text(text, MARGIN, this.y);
    this.y += 8;
  }

  subtitle(text: string) {
    this.ensureSpace(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(90, 90, 90);
    this.doc.text(text, MARGIN, this.y);
    this.doc.setTextColor(0, 0, 0);
    this.y += 7;
  }

  section(number: string, heading: string) {
    this.ensureSpace(10);
    this.y += 3;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(20, 60, 90);
    this.doc.text(`${number}  ${heading}`, MARGIN, this.y);
    this.doc.setTextColor(0, 0, 0);
    this.y += 4;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    this.y += 5;
  }

  text(text: string, opts: { bold?: boolean; size?: number } = {}) {
    this.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    this.doc.setFontSize(opts.size ?? 10);
    const lines: string[] = this.doc.splitTextToSize(text, MAX_WIDTH);
    lines.forEach((line) => {
      this.ensureSpace(5.5);
      this.doc.text(line, MARGIN, this.y);
      this.y += 5.2;
    });
  }

  kv(label: string, value: string) {
    this.ensureSpace(5.5);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9.5);
    this.doc.text(`${label}:`, MARGIN, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(String(value), MARGIN + 55, this.y);
    this.y += 5.2;
  }

  spacer(mm = 4) {
    this.y += mm;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}

export function exportIncidentReportPdf(incident: Incident) {
  const w = new ReportWriter();
  const cause = getCauseAnalysisForIncident(incident.id);
  const priority = computeResponsePriority(incident);
  const darkContacts = getDarkContactsForIncident(incident.id);
  const replay = getReplayEvents(incident.id);

  w.title(`${incident.id} — INCIDENT INTELLIGENCE REPORT`);
  w.subtitle(`${incident.sector} · Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  w.spacer(2);

  // 01 Executive summary
  w.section('01', 'EXECUTIVE SUMMARY');
  w.text(
    `${incident.id} is a ${incident.characteristics.severity.toLowerCase()}-severity ${incident.headline.toLowerCase()} in the ${incident.region}. ` +
      `Satellite detection confidence is ${incident.characteristics.confidencePct.toFixed(1)}% over a ${incident.characteristics.areaKm2.toFixed(1)} km² area. ` +
      `Reverse-drift hindcasting estimates a probable origin near ${incident.hindcast.probableOriginPoint.latitude.toFixed(4)}°N, ${incident.hindcast.probableOriginPoint.longitude.toFixed(4)}°E ` +
      `(${incident.hindcast.confidencePct.toFixed(0)}% confidence). ${incident.vesselConnection.vesselsAnalyzed} vessel(s) were analyzed` +
      (incident.vesselConnection.topAssociationStrength > 0
        ? `, with a top candidate association strength of ${incident.vesselConnection.topAssociationStrength}/100.`
        : ', with no candidate vessels currently identified.') +
      ` Overall response priority is ${priority.priority}. This report presents investigative leads only — correlation does not establish vessel responsibility.`
  );

  // 02 Satellite detection
  w.section('02', 'SATELLITE DETECTION');
  w.kv('Status', incident.status);
  w.kv('Satellite', incident.detection.satellite);
  w.kv('Sensor', incident.detection.sensor);
  w.kv('Acquisition (UTC)', formatUtcClock(incident.detection.acquisitionUtc));
  w.kv('Source image', incident.detection.sourceImageId);
  w.kv('Detection method', incident.detection.detectionMethod);
  w.kv('Confidence', `${incident.detection.confidencePct.toFixed(1)}%`);
  w.text('DEMO SATELLITE DATA — imagery/mask rendering omitted from PDF export in Phase 3.', { size: 8.5 });

  // 03 Spill characteristics
  w.section('03', 'SPILL CHARACTERISTICS');
  w.kv('Area', `${incident.characteristics.areaKm2.toFixed(1)} km²`);
  w.kv('Length / Width', `${incident.characteristics.lengthKm.toFixed(1)} km / ${incident.characteristics.widthKm.toFixed(1)} km`);
  w.kv('Centroid', `${incident.characteristics.centroid.latitude.toFixed(4)}°N ${incident.characteristics.centroid.longitude.toFixed(4)}°E`);
  w.kv('Shape', incident.characteristics.shapeDescription);
  w.kv('Segments', String(incident.characteristics.segments));
  w.kv('Severity', incident.characteristics.severity);

  // 04 Environmental conditions
  w.section('04', 'ENVIRONMENTAL CONDITIONS');
  w.kv('Wind', `${incident.environment.windSpeedKt.toFixed(1)} kt @ ${incident.environment.windDirectionDeg}°`);
  w.kv('Current', `${incident.environment.currentSpeedKn.toFixed(1)} kn @ ${incident.environment.currentDirectionDeg}°`);
  w.kv('Wave height', `${incident.environment.waveHeightM.toFixed(1)} m`);
  w.kv('Sea surface temp', `${incident.environment.seaSurfaceTempC.toFixed(1)}°C`);

  // 05 Probable origin & hindcast
  w.section('05', 'PROBABLE ORIGIN & HINDCAST');
  w.kv('Probable origin', `${incident.hindcast.probableOriginPoint.latitude.toFixed(4)}°N ${incident.hindcast.probableOriginPoint.longitude.toFixed(4)}°E`);
  w.kv('Release window', `${formatUtcClock(incident.hindcast.estimatedReleaseStartUtc)} - ${formatUtcClock(incident.hindcast.estimatedReleaseEndUtc)}`);
  w.kv('Confidence', `${incident.hindcast.confidencePct.toFixed(0)}%`);
  w.text('Origin is an estimate with uncertainty, not a guaranteed exact point.', { size: 8.5 });

  // 06 AIS & vessel analysis
  w.section('06', 'AIS & VESSEL ANALYSIS');
  w.kv('Vessels analyzed', String(incident.vesselConnection.vesselsAnalyzed));
  if (incident.vesselConnection.candidateVesselIds.length === 0) {
    w.text('No candidate vessels identified.');
  } else {
    incident.vesselConnection.candidateVesselIds.forEach((vid) => {
      const v = getVesselById(vid);
      if (!v || !v.intelligence) return;
      w.text(
        `${v.name} (${v.type}) — association strength ${v.intelligence.associationStrength}/100, status ${v.intelligence.investigativeStatus}. ` +
          `Spill proximity ${v.intelligence.spillProximityKm.toFixed(1)} km, timing ${v.intelligence.timingCompatibilityScore}/100, ` +
          `route alignment ${v.intelligence.routeAlignmentScore}/100, environmental consistency ${v.intelligence.environmentalConsistencyScore}/100.`,
        { size: 9 }
      );
    });
  }
  w.text('Investigative lead only. Correlation does not establish vessel responsibility.', { size: 8.5, bold: true });

  // 07 Dark vessel intelligence
  w.section('07', 'DARK VESSEL INTELLIGENCE');
  if (darkContacts.length === 0) {
    w.text('No dark contacts identified for this incident.');
  } else {
    darkContacts.forEach((dc) => {
      w.text(
        `${dc.contactId} — ${dc.estimatedType}, AIS match: ${dc.aisMatchStatus}, distance to origin ${dc.distanceToOriginKm.toFixed(1)} km, ` +
          `priority ${dc.priority}, status ${dc.status}.`,
        { size: 9 }
      );
    });
  }

  // 08 Counterfactual analysis
  w.section('08', 'COUNTERFACTUAL ANALYSIS');
  const topCandidateId = incident.vesselConnection.candidateVesselIds[0];
  const cf = topCandidateId ? getCounterfactualForVessel(topCandidateId, incident.id) : undefined;
  if (cf) {
    const vessel = getVesselById(cf.vesselId);
    w.kv('Vessel', vessel?.name ?? cf.vesselId);
    w.kv('Spatial / Temporal', `${cf.spatialConsistency} / ${cf.temporalConsistency}`);
    w.kv('Trajectory / Environmental', `${cf.trajectoryConsistency} / ${cf.environmentalConsistency}`);
    w.kv('Overall', cf.overall);
    w.kv('Confidence', `${cf.confidencePct}%`);
    cf.reasoning.forEach((r) => w.text(`- ${r}`, { size: 9 }));
    w.text('This is not a determination of responsibility.', { size: 8.5, bold: true });
  } else {
    w.text('No counterfactual analysis available.');
  }

  // 09 Forecast
  w.section('09', 'FORECAST');
  w.text('T0 (current): ' + `${incident.characteristics.areaKm2.toFixed(1)} km²`);
  w.text('See Investigation > Forecast panel for T+6H/T+12H/T+24H projected footprints and confidence.');

  // 10 Environmental & fisheries impact
  w.section('10', 'ENVIRONMENTAL & FISHERIES IMPACT');
  w.kv('Fishing zones at risk', incident.impact.fishingZonesAtRisk.join(', ') || 'None');
  w.kv('MPAs at risk', incident.impact.mpasAtRisk.join(', ') || 'None');
  w.kv('Coastline distance / ETA', `${incident.impact.coastlineDistanceKm.toFixed(1)} km / ${incident.impact.coastlineEtaHours ?? 'N/A'} hr`);
  w.kv('Fisheries / Environmental risk', `${incident.impact.fisheriesRisk} / ${incident.impact.environmentalRisk}`);
  w.kv('Overall response priority (impact model)', incident.impact.overallResponsePriority);

  // 11 Probable cause
  w.section('11', 'PROBABLE CAUSE');
  if (cause) {
    w.kv('Cause', cause.cause);
    w.kv('Confidence', `${cause.confidencePct}%`);
    cause.featureContributions.forEach((f) => w.text(`- ${f.feature} (${f.weightPct}%): ${f.note}`, { size: 9 }));
  } else {
    w.text('UNKNOWN / INSUFFICIENT EVIDENCE');
  }

  // 12 Response priority
  w.section('12', 'RESPONSE PRIORITY');
  w.kv('Priority', priority.priority);
  w.kv('Composite score', `${priority.scoreOf100}/100`);
  priority.reasons.forEach((r) => w.text(`- ${r.factor}: ${r.detail}`, { size: 9 }));

  // 13 Evidence chain
  w.section('13', 'EVIDENCE CHAIN');
  incident.evidenceChain.forEach((e) => {
    w.text(`[${e.stage}] ${formatUtcClock(e.timestampUtc)} — ${e.summary}${e.confidencePct !== undefined ? ` (${e.confidencePct.toFixed(0)}%)` : ''}`, { size: 9 });
  });

  // 14 Time-based incident replay
  w.section('14', 'TIME-BASED INCIDENT REPLAY');
  w.text(`${replay.length} replay event(s) reconstructed from T-24H to T+24H relative to detection.`);
  replay
    .sort((a, b) => a.offsetHours - b.offsetHours)
    .forEach((ev) => {
      w.text(`T${ev.offsetHours >= 0 ? '+' : ''}${ev.offsetHours.toFixed(1)}H — [${ev.type}] ${ev.title}: ${ev.description}`, { size: 8.5 });
    });

  w.spacer(6);
  w.text(`Report generated by NEERNETRA — DEMO MODEL OUTPUT throughout unless otherwise noted. Not legal proof; investigative dossier only.`, { size: 8, bold: true });

  w.save(`${incident.id}-investigation-dossier-${formatUtcDate(new Date().toISOString())}.pdf`);
}

export function exportAreaReportPdf(region: string, regionIncidents: Incident[]) {
  const w = new ReportWriter();
  w.title(`${region.toUpperCase()} — AREA INTELLIGENCE REPORT`);
  w.subtitle(`Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${regionIncidents.length} incident(s)`);
  w.spacer(2);

  const totalArea = regionIncidents.reduce((s, i) => s + i.impact.affectedAreaKm2, 0);
  const highSeverity = regionIncidents.filter((i) => i.characteristics.severity === 'HIGH' || i.characteristics.severity === 'CRITICAL').length;

  w.section('01', 'AREA OVERVIEW');
  w.kv('Area', region);
  w.kv('Incident count', String(regionIncidents.length));
  w.kv('High-severity incidents', String(highSeverity));
  w.kv('Total affected area', `${totalArea.toFixed(1)} km²`);

  w.section('02', 'INCIDENT OVERVIEW');
  regionIncidents.forEach((inc) => {
    w.text(`${inc.id} — ${inc.characteristics.severity} — ${inc.status} — ${inc.characteristics.areaKm2.toFixed(1)} km² — ${formatUtcDate(inc.createdUtc)}`, { size: 9.5 });
  });

  w.section('03', 'PROBABLE CAUSE DISTRIBUTION');
  const causeCounts: Record<string, number> = {};
  regionIncidents.forEach((inc) => { causeCounts[inc.probableCause] = (causeCounts[inc.probableCause] ?? 0) + 1; });
  Object.entries(causeCounts).forEach(([cause, count]) => w.text(`${cause}: ${count}`, { size: 9.5 }));

  w.section('04', 'AREA RISK ASSESSMENT');
  const worstRisk = (key: keyof Incident['impact']) => {
    const order = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    return regionIncidents.reduce((worst, inc) => {
      const val = String(inc.impact[key]);
      return order.indexOf(val) > order.indexOf(worst) ? val : worst;
    }, 'LOW');
  };
  w.kv('Environmental risk', worstRisk('environmentalRisk'));
  w.kv('Fisheries risk', worstRisk('fisheriesRisk'));
  w.kv('Coastal risk', worstRisk('coastalRisk'));
  w.kv('Maritime risk', worstRisk('maritimeRisk'));

  w.spacer(6);
  w.text('Report generated by NEERNETRA — investigation dossier, not legal proof.', { size: 8, bold: true });

  w.save(`${region.toLowerCase().replace(/\s+/g, '-')}-area-report-${formatUtcDate(new Date().toISOString())}.pdf`);
}
