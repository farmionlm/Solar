import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, modulePower, totalKwp, totalModules, units } = body;

    // Validate request
    if (!modulePower || !totalKwp || !totalModules || !units || !Array.isArray(units)) {
      return NextResponse.json({ error: 'Dados incompletos ou inválidos.' }, { status: 400 });
    }

    // Save to database
    const project = await prisma.project.create({
      data: {
        name: name || 'Projeto sem nome',
        modulePower,
        totalKwp,
        totalModules,
        units: {
          create: units.map((unit: any) => ({
            code: String(unit.code),
            name: String(unit.name),
            monthlyCons: Number(unit.monthlyCons),
            dailyCons: Number(unit.dailyCons),
            requiredKwp: Number(unit.requiredKwp),
            requiredModules: Number(unit.requiredModules),
          })),
        },
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar no banco de dados.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { units: true }
        },
        units: true
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar dados.' }, { status: 500 });
  }
}
