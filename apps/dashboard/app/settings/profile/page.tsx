import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

async function getProfile() {
  const profile = await prisma.candidateProfile.findFirst();
  return profile || null;
}

async function saveProfile(formData: FormData) {
  'use server';
  const id = (formData.get('id') as string) || undefined;
  const firstName = String(formData.get('firstName') || '');
  const lastName = String(formData.get('lastName') || '');
  const email = String(formData.get('email') || '');
  const phone = (formData.get('phone') as string) || null;
  const location = (formData.get('location') as string) || null;
  const linkedinUrl = (formData.get('linkedinUrl') as string) || null;
  const portfolioUrl = (formData.get('portfolioUrl') as string) || null;
  const resumeFile = (formData.get('resume') as File | null) || null;
  const resumeBytes = resumeFile ? Buffer.from(await resumeFile.arrayBuffer()) : null;

  await prisma.candidateProfile.upsert({
    where: { id: id || '' },
    update: {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      location: location || undefined,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      resumeBytes
    },
    create: {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      location: location || undefined,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      resumeBytes
    }
  });

  revalidatePath('/settings/profile');
}

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1>Candidate Profile</h1>
      <form action={saveProfile} style={{ display: 'grid', gap: 12 }}>
        <input type="hidden" name="id" defaultValue={profile?.id || ''} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            <div>First name</div>
            <input name="firstName" required defaultValue={(profile as any)?.firstName || ''} />
          </label>
          <label>
            <div>Last name</div>
            <input name="lastName" required defaultValue={(profile as any)?.lastName || ''} />
          </label>
        </div>
        <label>
          <div>Email</div>
          <input name="email" type="email" required defaultValue={profile?.email || ''} />
        </label>
        <label>
          <div>Phone</div>
          <input name="phone" defaultValue={profile?.phone || ''} />
        </label>
        <label>
          <div>Location</div>
          <input name="location" defaultValue={profile?.location || ''} />
        </label>
        <label>
          <div>Resume (PDF)</div>
          <input name="resume" type="file" accept="application/pdf" />
        </label>
        <label>
          <div>LinkedIn URL</div>
          <input name="linkedinUrl" defaultValue={profile?.linkedinUrl || ''} />
        </label>
        <label>
          <div>Portfolio URL</div>
          <input name="portfolioUrl" defaultValue={profile?.portfolioUrl || ''} />
        </label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}


