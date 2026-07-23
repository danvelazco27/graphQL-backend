import { GraphQLError } from "graphql";
import { prisma } from "../db.js";
import { validateEmail, validateRequiredFields } from "../utils/validation.js";

export async function getContacts(userId: string) {
  const contacts = await prisma.contact.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return contacts.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getContact(userId: string, contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) {
    throw new GraphQLError("Contact not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (contact.ownerId !== userId) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    createdAt: contact.createdAt.toISOString(),
  };
}

export async function createContact(
  userId: string,
  data: { name: string; email: string; phone: string }
) {
  const missingField = validateRequiredFields(data);
  if (missingField) {
    throw new GraphQLError(missingField, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (!validateEmail(data.email)) {
    throw new GraphQLError("Invalid email format", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      ownerId: userId,
    },
  });

  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    createdAt: contact.createdAt.toISOString(),
  };
}

export async function updateContact(
  userId: string,
  id: string,
  data: { name?: string; email?: string; phone?: string }
) {
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    throw new GraphQLError("Contact not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (contact.ownerId !== userId) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  if (data.email && !validateEmail(data.email)) {
    throw new GraphQLError("Invalid email format", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function deleteContact(userId: string, id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });

  if (!contact) {
    throw new GraphQLError("Contact not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (contact.ownerId !== userId) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  await prisma.contact.delete({ where: { id } });

  return true;
}
