import type { MessagingApp, PartyCommunication, PartyCommunicationChannel, PartyFunctionTypeValues } from '@/db/schema';

export interface PartyCommunicationAppDto {
  app: MessagingApp;
  handle: string | null;
}

export type PartyCommunicationFunction = typeof PartyFunctionTypeValues.ORDERING;

export class PartyCommunicationDto {
  id: string;
  partyId: string;
  channel: PartyCommunicationChannel;
  value: string;
  isPrimary: boolean;
  isActive: boolean;
  apps: PartyCommunicationAppDto[];
  functions: PartyCommunicationFunction[];
  createdAt: string;
  updatedAt: string;

  // Maps a PartyCommunication entity (with its optional messaging apps and functions) to a PartyCommunicationDto
  static from(
    entity: PartyCommunication,
    apps: PartyCommunicationAppDto[] = [],
    functions: PartyCommunicationFunction[] = [],
  ): PartyCommunicationDto {
    const dto = new PartyCommunicationDto();
    dto.id = entity.id;
    dto.partyId = entity.partyId;
    dto.channel = entity.channel;
    dto.value = entity.value;
    dto.isPrimary = entity.isPrimary;
    dto.isActive = entity.isActive;
    dto.apps = apps;
    dto.functions = functions;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
