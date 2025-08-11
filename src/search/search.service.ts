import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { WalmartApiResponse, WalmartProduct } from './types';
import { FullSearchQueryDto } from './dtos';

// Interface for the signature response
export interface SignatureResponse {
  signature: string;
  timestamp: number;
}

@Injectable()
export class SearchService {
  private readonly walmartApiUrl: string;

  private readonly consumerID: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    const walmartApiUrlEnv = this.configService.get<string>(
      'WALMART_SEARCH_API_URL',
    );
    if (!walmartApiUrlEnv) {
      throw new Error('WALMART_SEARCH_API_URL is not defined');
    }
    this.walmartApiUrl = walmartApiUrlEnv;

    const consumerIDEnv = this.configService.get<string>('WALMART_CONSUMER_ID');
    if (!consumerIDEnv) {
      throw new Error('WALMART_CONSUMER_ID is not defined');
    }
    this.consumerID = consumerIDEnv;
  }

  private generateSignature(): SignatureResponse {
    try {
      const timestamp = new Date().getTime();
      const keyVersion = '1';
      const message = `${this.consumerID}\n${timestamp}\n${keyVersion}\n`;
      const rsaSigner = crypto.createSign('RSA-SHA256');
      rsaSigner.update(message);

      // Read the private key path from environment variables
      const privateKeyPath = this.configService.get<string>('PRIVATE_KEY_PATH');

      // Check if the path exists
      if (!privateKeyPath) {
        throw new Error('PRIVATE_KEY_PATH environment variable is not set');
      }

      // Resolve the path (handles relative paths)
      const resolvedPath = path.resolve(privateKeyPath);
      const privateKey = fs.readFileSync(resolvedPath, 'utf8');

      const signature = rsaSigner.sign(privateKey, 'base64');
      return { signature, timestamp };
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new Error(`Failed to generate signature: ${error.message}`);
    }
  }

  async searchWalmart(
    options: FullSearchQueryDto,
  ): Promise<WalmartApiResponse> {
    const { signature, timestamp } = this.generateSignature();

    const walmartHeaders = {
      'WM_CONSUMER.ID': this.consumerID,
      'WM_CONSUMER.INTIMESTAMP': timestamp,
      'WM_SEC.KEY_VERSION': '1',
      'WM_SEC.AUTH_SIGNATURE': signature,
    };

    const observable = this.http
      .get(this.walmartApiUrl, {
        headers: walmartHeaders,
        params: options,
      })
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          console.error('Error fetching Walmart data:', error);
          console.error('Error message:', error.message);
          console.error('Error response:', error.response?.data);
          throw new Error(error);
        }),
      );

    return firstValueFrom(observable);
  }

  /**
   * Get just the products array from the Walmart API response
   * @param product The product name or keyword to search for
   * @param options Optional search parameters including pagination
   * @returns Array of formatted product strings
   */
  async getProductsNameAndPrice(
    options: FullSearchQueryDto,
  ): Promise<string[]> {
    const response = await this.searchWalmart(options);
    console.log('Total results: ' + response.totalResults);
    const names: string[] = [];
    for (const product of response.items) {
      names.push(`${product.name} - ${product.salePrice}`);
    }
    return names;
  }

  /**
   * Get full product details from the Walmart API response
   * @param product The product name or keyword to search for
   * @param options Optional search parameters including pagination
   * @returns Array of WalmartProduct objects
   */
  async getWalmartProducts(
    options: FullSearchQueryDto,
  ): Promise<WalmartProduct[]> {
    const response = await this.searchWalmart(options);
    console.log('Total results: ' + response.totalResults);
    return response.items;
  }
}
