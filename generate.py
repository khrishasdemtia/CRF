import torch
from model import SmallGPT

# load model
vocab_size = 30  # adjust based on your dataset
model = SmallGPT(vocab_size)
model.load_state_dict(torch.load("small_gpt.pth"))
model.eval()

# encoding/decoding from training
chars = ['\n', ' ', 'a', 'b', ...]  # same as training
stoi = {ch:i for i,ch in enumerate(chars)}
itos = {i:ch for ch,i in stoi.items()}

def encode(s): return [stoi[c] for c in s]
def decode(l): return ''.join([itos[i] for i in l])

context = torch.tensor([encode("hello ")], dtype=torch.long)
generated = context

for _ in range(100):
    logits = model(generated)
    next_token = torch.multinomial(torch.softmax(logits[0, -1], dim=-1), num_samples=1)
    generated = torch.cat((generated, next_token.unsqueeze(0)), dim=1)

print(decode(generated[0].tolist()))
