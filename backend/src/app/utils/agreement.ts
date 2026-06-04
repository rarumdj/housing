import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getUploadsDir } from './storage';

interface AgreementData {
  landlord: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessName?: string;
  };
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalIdType?: string;
    nationalIdNumber?: string;
    employmentStatus?: string;
    employerName?: string;
    currentAddress?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    nextOfKinRelationship?: string;
  };
  property: {
    title: string;
    address: string;
    lga?: string;
    state?: string;
    type: string;
  };
  lease: {
    rentStartDate: string;
    rentEndDate: string;
    monthlyRent: number;
    annualRent: number;
    cautionDeposit: number;
  };
  generatedAt: Date;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const formatDate = (d: string | Date): string => {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const generateAgreementPdf = async (data: AgreementData): Promise<{ filePath: string; url: string; hash: string }> => {
  const uploadsDir = getUploadsDir();
  const dir = path.join(uploadsDir, 'agreements');
  fs.mkdirSync(dir, { recursive: true });

  const filename = `agreement-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
  const filePath = path.join(dir, filename);
  const url = `/uploads/agreements/${filename}`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60, bufferPages: true });
    const hashStream = crypto.createHash('sha256');
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.on('data', (chunk: Buffer) => hashStream.update(chunk));

    const l = data.landlord;
    const t = data.tenant;
    const p = data.property;
    const le = data.lease;
    const fullAddress = [p.address, p.lga, p.state].filter(Boolean).join(', ');

    // --- Title ---
    doc.fontSize(20).font('Helvetica-Bold').text('TENANCY AGREEMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666')
      .text(`Generated on ${formatDate(data.generatedAt)}`, { align: 'center' });
    doc.moveDown(1);

    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#E5E7EB').stroke();
    doc.moveDown(1);

    // --- Preamble ---
    doc.fontSize(11).font('Helvetica').fillColor('#111111');
    doc.text(
      `This Tenancy Agreement ("Agreement") is entered into on ${formatDate(le.rentStartDate)} ` +
      `between the Landlord and the Tenant for the property described below.`,
    );
    doc.moveDown(1);

    // --- Section helper ---
    const sectionTitle = (title: string) => {
      doc.moveDown(0.5);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#111111').text(title);
      doc.moveDown(0.3);
      doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#E5E7EB').stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#333333');
    };

    const field = (label: string, value: string | undefined) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(value || 'N/A');
    };

    // --- 1. Landlord Details ---
    sectionTitle('1. LANDLORD DETAILS');
    field('Full Name', `${l.firstName} ${l.lastName}`);
    field('Email', l.email);
    field('Phone', l.phone);
    if (l.businessName) field('Business Name', l.businessName);
    doc.moveDown(0.5);

    // --- 2. Tenant Details ---
    sectionTitle('2. TENANT DETAILS');
    field('Full Name', `${t.firstName} ${t.lastName}`);
    field('Email', t.email);
    field('Phone', t.phone);
    field('ID Type', t.nationalIdType?.replace(/_/g, ' '));
    field('ID Number', t.nationalIdNumber);
    field('Employment', t.employmentStatus?.replace(/_/g, ' '));
    if (t.employerName) field('Employer', t.employerName);
    if (t.currentAddress) field('Current Address', t.currentAddress);
    doc.moveDown(0.5);

    // --- 3. Property Details ---
    sectionTitle('3. PROPERTY DETAILS');
    field('Property', p.title);
    field('Address', fullAddress);
    field('Type', p.type.replace(/_/g, ' '));
    doc.moveDown(0.5);

    // --- 4. Financial Terms ---
    sectionTitle('4. FINANCIAL TERMS');
    field('Annual Rent', formatCurrency(le.annualRent));
    field('Monthly Equivalent', formatCurrency(le.monthlyRent));
    field('Caution Deposit', formatCurrency(le.cautionDeposit));
    field('Lease Period', `${formatDate(le.rentStartDate)} — ${formatDate(le.rentEndDate)}`);
    doc.moveDown(0.5);

    // --- 5. Next of Kin ---
    sectionTitle('5. NEXT OF KIN / GUARANTOR');
    field('Name', t.nextOfKinName);
    field('Phone', t.nextOfKinPhone);
    field('Relationship', t.nextOfKinRelationship);
    doc.moveDown(0.5);

    // --- 6. Terms & Conditions ---
    sectionTitle('6. TERMS AND CONDITIONS');
    const terms = [
      'The Tenant shall use the property solely for residential purposes unless otherwise agreed.',
      'Rent is payable in advance. Failure to pay rent within 14 days of the due date may result in termination of this agreement.',
      'The Tenant shall maintain the property in good condition and promptly report any damages to the Landlord.',
      'The Tenant shall not make structural alterations without the prior written consent of the Landlord.',
      'The Landlord shall ensure the property is habitable and carry out necessary repairs to the structure and exterior.',
      'Either party may terminate this agreement by giving at least one month\'s written notice before the expiry of the lease term.',
      'The caution deposit shall be refunded to the Tenant at the end of the tenancy, less any deductions for damages or unpaid rent.',
      'This agreement shall be governed by the laws of the Federal Republic of Nigeria and the tenancy regulations of the applicable state.',
    ];
    terms.forEach((term, i) => {
      doc.text(`${i + 1}. ${term}`);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // --- Signature Block ---
    sectionTitle('7. SIGNATURES');
    doc.moveDown(1);

    doc.font('Helvetica').text('_____________________________', { align: 'left' });
    doc.text(`Landlord: ${l.firstName} ${l.lastName}`);
    doc.text('Date: _______________');
    doc.moveDown(1.5);

    doc.text('_____________________________', { align: 'left' });
    doc.text(`Tenant: ${t.firstName} ${t.lastName}`);
    doc.text('Date: _______________');
    doc.moveDown(1);

    // --- Footer ---
    doc.moveDown(1);
    doc.fontSize(8).fillColor('#999999')
      .text('This document was auto-generated by HouseHunt. Both parties should review all terms before signing.', { align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      const hash = hashStream.digest('hex');
      resolve({ filePath, url, hash });
    });

    writeStream.on('error', reject);
  });
}
