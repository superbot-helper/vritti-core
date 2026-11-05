import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PartySelectQueryDto } from './party-select-query.dto';

export const PARTY_COMMUNICATION_SELECT_CHANNELS = ['EMAIL', 'PHONE'] as const;
export type PartyCommunicationSelectChannel = (typeof PARTY_COMMUNICATION_SELECT_CHANNELS)[number];

export class PartyCommunicationSelectQueryDto extends PartySelectQueryDto {
  @ApiProperty({ description: 'Channel of the communications to list', enum: PARTY_COMMUNICATION_SELECT_CHANNELS })
  @IsIn(PARTY_COMMUNICATION_SELECT_CHANNELS)
  channel: PartyCommunicationSelectChannel;

  @ApiPropertyOptional({ description: 'Only communications holding this function', enum: ['ORDERING'] })
  @IsOptional()
  @IsIn(['ORDERING'])
  function?: 'ORDERING';
}
