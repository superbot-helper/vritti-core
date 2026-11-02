import { IsIn, IsOptional } from 'class-validator';
import { PartyCommunicationChannelValues, PartyFunctionTypeValues } from '@/db/schema';
import { PartySelectQueryDto } from './party-select-query.dto';

export const PARTY_COMMUNICATION_SELECT_CHANNELS = [
  PartyCommunicationChannelValues.EMAIL,
  PartyCommunicationChannelValues.PHONE,
] as const;
export type PartyCommunicationSelectChannel = (typeof PARTY_COMMUNICATION_SELECT_CHANNELS)[number];

export class PartyCommunicationSelectQueryDto extends PartySelectQueryDto {
  @IsIn(PARTY_COMMUNICATION_SELECT_CHANNELS)
  channel: PartyCommunicationSelectChannel;

  @IsOptional()
  @IsIn([PartyFunctionTypeValues.ORDERING])
  function?: typeof PartyFunctionTypeValues.ORDERING;
}
