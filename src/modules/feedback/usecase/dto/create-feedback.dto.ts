import { IsString, IsNotEmpty, IsInt, Min, Max, IsUUID } from 'class-validator';

export class CreateFeedbackDto {
  @IsString({ message: 'Transaction ID must be a string.' })
  @IsNotEmpty({ message: 'Transaction ID is required.' })
  @IsUUID()
  transactionId: string;

  @IsString({ message: 'User ID must be a string.' })
  @IsNotEmpty({ message: 'User ID is required.' })
  @IsUUID()
  createdBy: string;

  @IsString({ message: 'Comment must be a string.' })
  @IsNotEmpty({ message: 'Comment is required.' })
  comment: string;

  @IsInt({ message: 'Star rating must be an integer.' })
  @Min(1, { message: 'Star rating must be at least 1.' })
  @Max(5, { message: 'Star rating cannot exceed 5.' })
  star: number;
}
