import { Test, TestingModule } from '@nestjs/testing';
import { PenelitianController } from './penelitian.controller';
import { PenelitianService } from './penelitian.service';

describe('PenelitianController', () => {
  let controller: PenelitianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenelitianController],
      providers: [PenelitianService],
    }).compile();

    controller = module.get<PenelitianController>(PenelitianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
