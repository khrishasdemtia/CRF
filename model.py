import torch
import torch.nn as nn
import torch.nn.functional as F

class SmallGPT(nn.Module):
    def __init__(self, vocab_size, embed_dim=128, num_heads=4, num_layers=2):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.pos_embed = nn.Embedding(1000, embed_dim)
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(embed_dim, num_heads)
            for _ in range(num_layers)
        ])
        self.fc_out = nn.Linear(embed_dim, vocab_size)

    def forward(self, x):
        positions = torch.arange(0, x.size(1), device=x.device)
        x = self.embed(x) + self.pos_embed(positions)
        for layer in self.layers:
            x = layer(x)
        logits = self.fc_out(x)
        return logits
