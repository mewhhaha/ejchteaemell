import { generateSignalsClient } from "./runtime/signals-client.mts";
import { into, type Html } from "./runtime/node.mts";

export function withSignals(htmlContent: Html): Html {
  const generator = async function* (): AsyncGenerator<string> {
    yield "<!DOCTYPE html>";
    yield "<html>";
    yield "<head>";
    yield generateSignalsClient();
    yield "</head>";
    yield "<body>";
    
    for await (const chunk of htmlContent.text) {
      yield chunk;
    }
    
    yield "</body>";
    yield "</html>";
  };
  
  return into(generator());
}

export function signalsScript(): Html {
  return into(generateSignalsClient());
}