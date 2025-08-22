import { Test, TestingModule } from '@nestjs/testing';
import { PenelitianService } from './penelitian.service';

describe('PenelitianService', () => {
  let service: PenelitianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenelitianService],
    }).compile();

    service = module.get<PenelitianService>(PenelitianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
